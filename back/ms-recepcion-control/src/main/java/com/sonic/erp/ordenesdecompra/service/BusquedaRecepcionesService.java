package com.sonic.erp.ordenesdecompra.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sonic.erp.ordenesdecompra.dto.response.RecepcionDetalleResponse;
import com.sonic.erp.ordenesdecompra.dto.response.RecepcionResumenResponse;
import com.sonic.erp.ordenesdecompra.entity.DetalleRecepcion;
import com.sonic.erp.ordenesdecompra.entity.Recepcion;
import com.sonic.erp.ordenesdecompra.repository.DetalleRecepcionRepository;
import com.sonic.erp.ordenesdecompra.repository.RecepcionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BusquedaRecepcionesService {

    private final RecepcionRepository recepcionRepository;
    private final DetalleRecepcionRepository detalleRecepcionRepository;
    private final RestTemplate restTemplate;
    private final String ordenesBaseUrl;

    public BusquedaRecepcionesService(
            RecepcionRepository recepcionRepository,
            DetalleRecepcionRepository detalleRecepcionRepository,
            RestTemplate restTemplate,
            @Value("${servicios.ordenes-compra.base-url:http://localhost:8081}")
            String ordenesBaseUrl) {
        this.recepcionRepository = recepcionRepository;
        this.detalleRecepcionRepository = detalleRecepcionRepository;
        this.restTemplate = restTemplate;
        this.ordenesBaseUrl = ordenesBaseUrl;
    }

    @Transactional(readOnly = true)
    public List<RecepcionResumenResponse> buscar(
            Long idOrden,
            Long proveedorId,
            LocalDate desde,
            LocalDate hasta) {

        if (idOrden != null && idOrden <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El identificador de la orden debe ser positivo"
            );
        }

        if (proveedorId != null && proveedorId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El identificador del proveedor debe ser positivo"
            );
        }

        if (desde != null && hasta != null && desde.isAfter(hasta)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La fecha inicial no puede ser posterior a la fecha final"
            );
        }

        List<Recepcion> recepciones =
                recepcionRepository.buscar(idOrden, desde, hasta);

        Map<Long, OrdenApi> ordenesPorId = cargarOrdenes(recepciones);

        return recepciones.stream()
                .filter(recepcion -> {
                    if (proveedorId == null) {
                        return true;
                    }

                    OrdenApi orden = ordenesPorId.get(recepcion.getIdOrden());
                    return orden != null
                            && proveedorId.equals(orden.proveedorId());
                })
                .map(recepcion -> {
                    OrdenApi orden =
                            ordenesPorId.get(recepcion.getIdOrden());

                    return new RecepcionResumenResponse(
                            recepcion.getIdRecepcion(),
                            recepcion.getIdOrden(),
                            orden == null ? null : orden.numero(),
                            orden == null ? null : orden.proveedorId(),
                            recepcion.getFecha(),
                            recepcion.getDocumento(),
                            recepcion.getAlmacen(),
                            recepcion.getEstado()
                    );
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public RecepcionDetalleResponse consultarDetalle(Long idRecepcion) {
        if (idRecepcion == null || idRecepcion <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El identificador de la recepción debe ser positivo"
            );
        }

        Recepcion recepcion = recepcionRepository.findById(idRecepcion)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La recepción no existe"
                ));

        OrdenApi orden = recepcion.getIdOrden() == null
                ? null
                : consultarOrden(recepcion.getIdOrden());

        List<RecepcionDetalleResponse.LineaResponse> detalles =
                detalleRecepcionRepository
                        .findByRecepcionIdRecepcion(idRecepcion)
                        .stream()
                        .map(this::construirLinea)
                        .toList();

        return new RecepcionDetalleResponse(
                recepcion.getIdRecepcion(),
                recepcion.getIdOrden(),
                orden == null ? null : orden.numero(),
                orden == null ? null : orden.proveedorId(),
                recepcion.getFecha(),
                recepcion.getDocumento(),
                recepcion.getAlmacen(),
                recepcion.getEstado(),
                recepcion.getObservacion(),
                recepcion.getCostoTransporte(),
                recepcion.getConceptoTransporte(),
                recepcion.getComprobanteTransporte(),
                detalles
        );
    }

    private Map<Long, OrdenApi> cargarOrdenes(
            List<Recepcion> recepciones) {

        Map<Long, OrdenApi> ordenes = new HashMap<>();

        for (Recepcion recepcion : recepciones) {
            Long idOrden = recepcion.getIdOrden();

            if (idOrden != null && !ordenes.containsKey(idOrden)) {
                ordenes.put(idOrden, consultarOrden(idOrden));
            }
        }

        return ordenes;
    }

    private OrdenApi consultarOrden(Long idOrden) {
        String url = ordenesBaseUrl + "/api/ordenes-compra/" + idOrden;

        try {
            OrdenApi orden =
                    restTemplate.getForObject(url, OrdenApi.class);

            if (orden == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Órdenes devolvió una respuesta vacía"
                );
            }

            return orden;
        } catch (RestClientException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "No se pudo consultar la orden en el servicio de Órdenes",
                    e
            );
        }
    }

    private RecepcionDetalleResponse.LineaResponse construirLinea(
            DetalleRecepcion detalle) {
        return new RecepcionDetalleResponse.LineaResponse(
                detalle.getIdDetalle(),
                detalle.getProductoId(),
                detalle.getCantidadRecibida(),
                detalle.getCantidadAceptada(),
                detalle.getObservacion()
        );
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record OrdenApi(
            Long idOrden,
            String numero,
            Long proveedorId
    ) {
    }
}