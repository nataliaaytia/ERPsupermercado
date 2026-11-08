
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

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
