
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
import com.sonic.erp.ordenesdecompra.dto.response.AprobacionOrdenCompraResponse;
import com.sonic.erp.ordenesdecompra.entity.HistorialDevolucionOrdenCompra;
import com.sonic.erp.ordenesdecompra.entity.HistorialEstadoOrdenCompra;
import java.time.LocalDateTime;
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

    @Transactional
    public OrdenCompra solicitarAprobacion(Long idOrden) {

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
                    "Solo las ordenes en BORRADOR pueden solicitar aprobacion");
        }

        if (orden.getDetalles() == null ||
                orden.getDetalles().isEmpty() ||
                orden.getTotal() == null ||
                orden.getTotal().compareTo(BigDecimal.ZERO) <= 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La orden no contiene productos o importes validos");
        }

        if (orden.getProveedorId() == null
                || orden.getProveedorId() <= 0
                || orden.getIdOferta() == null
                || orden.getNumero() == null
                || orden.getNumero().isBlank()
                || orden.getFecha() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La orden contiene datos generales incompletos");
        }

        BigDecimal totalCalculado = BigDecimal.ZERO;
        Set<Long> productos = new HashSet<>();

        for (DetalleOrdenCompra detalle : orden.getDetalles()) {

            if (detalle == null
                    || detalle.getProductoId() == null
                    || detalle.getProductoId() <= 0
                    || detalle.getCantidad() == null
                    || detalle.getCantidad() <= 0
                    || detalle.getPrecio() == null
                    || detalle.getPrecio().compareTo(BigDecimal.ZERO) <= 0
                    || detalle.getSubtotal() == null) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La orden contiene productos, cantidades o precios invalidos");
            }

            if (!productos.add(detalle.getProductoId())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La orden contiene productos duplicados");
            }

            BigDecimal subtotalCalculado = detalle.getPrecio()
                    .multiply(BigDecimal.valueOf(detalle.getCantidad()));

            if (subtotalCalculado.compareTo(detalle.getSubtotal()) != 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La orden contiene subtotales incorrectos");
            }

            totalCalculado = totalCalculado.add(subtotalCalculado);
        }

        if (totalCalculado.compareTo(orden.getTotal()) != 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El total de la orden no coincide con sus productos");
        }

        String estadoAnterior = orden.getEstado();

        LocalDateTime fechaCambio = LocalDateTime.now(
                ZoneId.of("America/La_Paz"));

        HistorialEstadoOrdenCompra cambio =
                HistorialEstadoOrdenCompra.builder()
                        .estadoAnterior(estadoAnterior)
                        .estadoNuevo("PENDIENTE_APROBACION")
                        .responsable("SIN_AUTENTICACION")
                        .fechaCambio(fechaCambio)
                        .observacion("Solicitud de aprobacion de la orden")
                        .build();

        orden.agregarCambioEstado(cambio);

        orden.setEstado("PENDIENTE_APROBACION");

        return ordenRepository.saveAndFlush(orden);
    }

    @Transactional
    public AprobacionOrdenCompraResponse aprobarOrden(
            Long idOrden,
            String usuarioAprobador,
            String rolAprobador,
            BigDecimal limiteAutorizado) {

        if (idOrden == null || idOrden <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El identificador de la orden no es valido");
        }

        if (usuarioAprobador == null ||
                usuarioAprobador.isBlank() ||
                !"JEFE_COMPRAS".equals(rolAprobador)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "El usuario no tiene permiso para aprobar ordenes");
        }

        OrdenCompra orden = ordenRepository.findById(idOrden)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La orden de compra no existe"));

        if (!"PENDIENTE_APROBACION".equals(orden.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La orden no esta pendiente de aprobacion");
        }

        if (orden.getTotal() == null ||
                orden.getTotal().compareTo(BigDecimal.ZERO) <= 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El monto de la orden no es valido");
        }

        if (limiteAutorizado == null ||
                limiteAutorizado.compareTo(BigDecimal.ZERO) < 0 ||
                orden.getTotal().compareTo(limiteAutorizado) > 0) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "El monto supera el limite autorizado");
        }

        orden.setEstado("APROBADA");
        orden.setAprobadoPor(usuarioAprobador);
        orden.setFechaAprobacion(
                LocalDateTime.now(ZoneId.of("America/La_Paz"))
        );

        OrdenCompra guardada = ordenRepository.saveAndFlush(orden);

        return new AprobacionOrdenCompraResponse(
                guardada.getIdOrden(),
                guardada.getNumero(),
                guardada.getEstado(),
                guardada.getAprobadoPor(),
                guardada.getFechaAprobacion(),
                guardada.getTotal()
        );
    }

    @Transactional
    public OrdenCompra devolverParaCorreccion(
            Long idOrden,
            String motivo) {

        if (idOrden == null || idOrden <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El identificador de la orden no es valido");
        }

        if (motivo == null || motivo.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe indicar el motivo de la devolucion");
        }

        String motivoLimpio = motivo.trim();

        if (motivoLimpio.length() > 500) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El motivo no puede superar 500 caracteres");
        }

        OrdenCompra orden = ordenRepository.findById(idOrden)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La orden de compra no existe"));

        if (!"PENDIENTE_APROBACION".equals(orden.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Solo se pueden devolver ordenes pendientes de aprobacion");
        }

        HistorialDevolucionOrdenCompra devolucion =
                HistorialDevolucionOrdenCompra.builder()
                        .motivo(motivoLimpio)
                        .responsable("SIN_AUTENTICACION")
                        .fechaDevolucion(
                                LocalDateTime.now(
                                        ZoneId.of("America/La_Paz")))
                        .build();

        orden.agregarDevolucion(devolucion);

        HistorialEstadoOrdenCompra cambio =
                HistorialEstadoOrdenCompra.builder()
                        .estadoAnterior(orden.getEstado())
                        .estadoNuevo("BORRADOR")
                        .responsable("SIN_AUTENTICACION")
                        .fechaCambio(devolucion.getFechaDevolucion())
                        .observacion(motivoLimpio)
                        .build();

        orden.agregarCambioEstado(cambio);

        orden.setObservacion(motivoLimpio);
        orden.setEstado("BORRADOR");

        return ordenRepository.saveAndFlush(orden);
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
