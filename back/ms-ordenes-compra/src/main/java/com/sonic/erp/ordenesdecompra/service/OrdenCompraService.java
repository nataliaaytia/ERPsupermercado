
package com.sonic.erp.ordenesdecompra.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sonic.erp.ordenesdecompra.entity.DetalleOrdenCompra;
import com.sonic.erp.ordenesdecompra.entity.OrdenCompra;
import com.sonic.erp.ordenesdecompra.repository.OrdenCompraRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import com.sonic.erp.ordenesdecompra.dto.response.OrdenCompraDetalleResponse;
import com.sonic.erp.ordenesdecompra.dto.request.EditarOrdenCompraRequest;
import com.sonic.erp.ordenesdecompra.dto.response.OrdenCompraResumenResponse;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import java.util.Locale;

@Service
public class OrdenCompraService {

    private final OrdenCompraRepository ordenRepository;
    private final RestClient cotizacionesClient;

    public OrdenCompraService(
            OrdenCompraRepository ordenRepository,
            RestClient.Builder builder,
            @Value("${servicios.cotizaciones.url:http://localhost:8082}")
            String urlCotizaciones) {

        this.ordenRepository = ordenRepository;
        this.cotizacionesClient = builder
                .baseUrl(urlCotizaciones)
                .build();
    }

    @Transactional
    public OrdenCompra generarDesdeOferta(
            Long idSolicitud, Long idOferta) {

        if (idSolicitud == null || idSolicitud <= 0 ||
                idOferta == null || idOferta <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Los identificadores deben ser validos");
        }

        ComparativaExterna comparativa;

        try {
            comparativa = cotizacionesClient.get()
                    .uri("/api/evaluacion-ofertas/solicitud/{id}",
                            idSolicitud)
                    .retrieve()
                    .body(ComparativaExterna.class);

        } catch (RestClientException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "No se pudo consultar el servicio de cotizaciones", e);
        }

        if (comparativa == null || comparativa.ofertas() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Respuesta invalida del servicio de cotizaciones");
        }

        OfertaExterna oferta = comparativa.ofertas().stream()
                .filter(o -> idOferta.equals(o.idOferta()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Oferta no encontrada en la solicitud"));

        if (!"SELECCIONADA".equalsIgnoreCase(oferta.estado())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La oferta no esta adjudicada");
        }

        if (oferta.validez() == null ||
                oferta.validez().isBefore(
                        LocalDate.now(ZoneId.of("America/La_Paz")))) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La oferta adjudicada esta vencida o no tiene fecha de validez");
        }

        if (ordenRepository.existsByIdOferta(idOferta)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya existe una orden para esta oferta");
        }

        if (oferta.proveedorId() == null ||
                oferta.detalles() == null ||
                oferta.detalles().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La oferta no contiene datos validos");
        }

        OrdenCompra orden = OrdenCompra.builder()
                .idOferta(idOferta)
                .proveedorId(oferta.proveedorId())
                .numero("OC-" + UUID.randomUUID().toString()
                        .toUpperCase())
                .fecha(LocalDate.now(
                        ZoneId.of("America/La_Paz")))
                .estado("BORRADOR")
                .total(BigDecimal.ZERO)
                .build();

        BigDecimal total = BigDecimal.ZERO;

        for (DetalleExterno item : oferta.detalles()) {

            if (item.productoId() == null ||
                    item.cantidad() == null ||
                    item.cantidad() <= 0 ||
                    item.precioUnitario() == null ||
                    item.precioUnitario().compareTo(
                            BigDecimal.ZERO) <= 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La oferta contiene productos o importes invalidos");
            }

            BigDecimal subtotal = item.precioUnitario()
                    .multiply(BigDecimal.valueOf(item.cantidad()));

            DetalleOrdenCompra detalle =
                    DetalleOrdenCompra.builder()
                            .productoId(item.productoId())
                            .cantidad(item.cantidad())
                            .precio(item.precioUnitario())
                            .subtotal(subtotal)
                            .build();

            orden.agregarDetalle(detalle);
            total = total.add(subtotal);
        }

        orden.setTotal(total);

        try {
            return ordenRepository.saveAndFlush(orden);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se pudo guardar la orden; verifica duplicados y datos",
                    e);
        }
    }

    @Transactional
    public OrdenCompra editarBorrador(
            Long idOrden,
            EditarOrdenCompraRequest request) {

        if (idOrden == null || idOrden <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El identificador de la orden no es valido");
        }

        OrdenCompra orden = ordenRepository.findById(idOrden)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La orden de compra no existe"));

        if (!"BORRADOR".equalsIgnoreCase(orden.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Solo se pueden editar ordenes en estado BORRADOR");
        }

        if (request == null ||
                request.detalles() == null ||
                request.detalles().isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La orden debe contener al menos un producto");
        }

        Map<Long, Integer> nuevasCantidades = new HashMap<>();

        for (EditarOrdenCompraRequest.Linea linea : request.detalles()) {

            if (linea == null ||
                    linea.productoId() == null ||
                    linea.productoId() <= 0 ||
                    linea.cantidad() == null ||
                    linea.cantidad() <= 0) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Los productos y cantidades deben ser validos");
            }

            if (nuevasCantidades.putIfAbsent(
                    linea.productoId(), linea.cantidad()) != null) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "No se permiten productos duplicados");
            }
        }

        Set<Long> productosExistentes = new HashSet<>();

        for (DetalleOrdenCompra detalle : orden.getDetalles()) {
            productosExistentes.add(detalle.getProductoId());
        }

        if (!productosExistentes.containsAll(nuevasCantidades.keySet())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No se pueden agregar productos ajenos a la orden");
        }

        orden.getDetalles().removeIf(
                detalle -> !nuevasCantidades.containsKey(
                        detalle.getProductoId()));

        BigDecimal nuevoTotal = BigDecimal.ZERO;

        for (DetalleOrdenCompra detalle : orden.getDetalles()) {

            Integer nuevaCantidad = nuevasCantidades.get(
                    detalle.getProductoId());

            BigDecimal nuevoSubtotal = detalle.getPrecio()
                    .multiply(BigDecimal.valueOf(nuevaCantidad));

            detalle.setCantidad(nuevaCantidad);
            detalle.setSubtotal(nuevoSubtotal);

            nuevoTotal = nuevoTotal.add(nuevoSubtotal);
        }

        orden.setTotal(nuevoTotal);

        return ordenRepository.saveAndFlush(orden);
    }

    @Transactional(readOnly = true)
    public OrdenCompraDetalleResponse consultarDetalle(Long idOrden) {

        if (idOrden == null || idOrden <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El identificador de la orden no es valido");
        }

        OrdenCompra orden = ordenRepository.findById(idOrden)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La orden de compra no existe"));

        List<OrdenCompraDetalleResponse.DetalleResponse> detalles =
                orden.getDetalles().stream()
                        .map(detalle ->
                                new OrdenCompraDetalleResponse.DetalleResponse(
                                        detalle.getIdDetalle(),
                                        detalle.getProductoId(),
                                        detalle.getCantidad(),
                                        detalle.getPrecio(),
                                        detalle.getSubtotal()
                                )
                        )
                        .toList();

        return new OrdenCompraDetalleResponse(
                orden.getIdOrden(),
                orden.getNumero(),
                orden.getIdOferta(),
                orden.getProveedorId(),
                orden.getFecha(),
                orden.getEstado(),
                orden.getTotal(),
                orden.getObservacion(),
                detalles
        );
    }

    @Transactional(readOnly = true)
    public Page<OrdenCompraResumenResponse> buscarOrdenes(
            String numero,
            Long proveedorId,
            String estado,
            int page,
            int size) {

        if (page < 0 || size < 1 || size > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La pagina debe ser mayor o igual a cero y el tamaño debe estar entre 1 y 100");
        }

        if (proveedorId != null && proveedorId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El identificador del proveedor no es valido");
        }

        Specification<OrdenCompra> filtros =
                (root, query, cb) -> cb.conjunction();

        if (numero != null && !numero.isBlank()) {
            String numeroBuscado =
                    numero.trim().toLowerCase(Locale.ROOT);

            filtros = filtros.and((root, query, cb) ->
                    cb.like(
                            cb.lower(root.get("numero")),
                            "%" + numeroBuscado + "%"
                    ));
        }

        if (proveedorId != null) {
            filtros = filtros.and((root, query, cb) ->
                    cb.equal(
                            root.get("proveedorId"),
                            proveedorId
                    ));
        }

        if (estado != null && !estado.isBlank()) {
            String estadoBuscado =
                    estado.trim().toUpperCase(Locale.ROOT);

            filtros = filtros.and((root, query, cb) ->
                    cb.equal(
                            cb.upper(root.get("estado")),
                            estadoBuscado
                    ));
        }

        Pageable paginacion = PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Direction.DESC,
                        "fecha",
                        "idOrden"
                )
        );

        Page<OrdenCompra> resultados =
                ordenRepository.findAll(filtros, paginacion);

        return resultados.map(orden ->
                new OrdenCompraResumenResponse(
                        orden.getIdOrden(),
                        orden.getNumero(),
                        orden.getIdOferta(),
                        orden.getProveedorId(),
                        orden.getFecha(),
                        orden.getEstado(),
                        orden.getTotal()
                ));
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ComparativaExterna(
            List<OfertaExterna> ofertas) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record OfertaExterna(
            Long idOferta,
            Long proveedorId,
            String estado,
            LocalDate validez,
            List<DetalleExterno> detalles) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record DetalleExterno(
            Long productoId,
            Integer cantidad,
            BigDecimal precioUnitario) {
    }
}
