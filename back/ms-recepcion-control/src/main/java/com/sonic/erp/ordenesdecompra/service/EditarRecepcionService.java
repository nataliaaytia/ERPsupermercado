package com.sonic.erp.ordenesdecompra.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sonic.erp.ordenesdecompra.dto.request.EditarRecepcionRequest;
import com.sonic.erp.ordenesdecompra.dto.response.RecepcionActualizadaResponse;
import com.sonic.erp.ordenesdecompra.entity.DetalleRecepcion;
import com.sonic.erp.ordenesdecompra.entity.Recepcion;
import com.sonic.erp.ordenesdecompra.repository.DetalleRecepcionRepository;
import com.sonic.erp.ordenesdecompra.repository.RecepcionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class EditarRecepcionService {

    private final RecepcionRepository recepcionRepository;
    private final DetalleRecepcionRepository detalleRecepcionRepository;
    private final RestTemplate restTemplate;
    private final String ordenesBaseUrl;

    public EditarRecepcionService(
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

    @Transactional
    public RecepcionActualizadaResponse editar(
            Long idRecepcion,
            EditarRecepcionRequest request) {

        if (idRecepcion == null || idRecepcion <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El identificador de la recepción no es válido"
            );
        }

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe enviar los datos de la recepción"
            );
        }

        Recepcion recepcion = recepcionRepository.findById(idRecepcion)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La recepción no existe"
                ));

        if ("AUTORIZADA".equalsIgnoreCase(recepcion.getEstado())
                || "VALIDADA".equalsIgnoreCase(recepcion.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede editar una recepción autorizada o validada"
            );
        }

        if (recepcion.getIdOrden() == null || recepcion.getIdOrden() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La recepción no tiene una orden vinculada"
            );
        }

        List<DetalleRecepcion> detallesExistentes =
                detalleRecepcionRepository.findByRecepcionIdRecepcion(
                        idRecepcion
                );

        if (detallesExistentes.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La recepción no tiene detalles para editar"
            );
        }

        boolean inspeccionIniciada = detallesExistentes.stream()
                .anyMatch(detalle ->
                        detalle.getInspecciones() != null
                                && !detalle.getInspecciones().isEmpty()
                );

        if (inspeccionIniciada) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede editar la recepción porque su inspección ya comenzó"
            );
        }

        Map<Long, DetalleRecepcion> detallesPorId = new HashMap<>();
        for (DetalleRecepcion detalle : detallesExistentes) {
            detallesPorId.put(detalle.getIdDetalle(), detalle);
        }

        Set<Long> idsDetalleSolicitados = new HashSet<>();
        Set<Long> productosSolicitados = new HashSet<>();

        for (EditarRecepcionRequest.DetalleRequest linea : request.detalles()) {
            if (linea == null
                    || linea.idDetalle() == null
                    || linea.productoId() == null
                    || linea.cantidadRecibida() == null
                    || linea.cantidadRecibida() <= 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Cada línea debe incluir detalle, producto y cantidad positiva"
                );
            }

            if (!idsDetalleSolicitados.add(linea.idDetalle())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "No se permiten líneas de detalle duplicadas"
                );
            }

            if (!productosSolicitados.add(linea.productoId())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "No se permiten productos duplicados en la recepción"
                );
            }

            if (!detallesPorId.containsKey(linea.idDetalle())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Una de las líneas no pertenece a esta recepción"
                );
            }
        }

        if (!idsDetalleSolicitados.equals(detallesPorId.keySet())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe enviar todas las líneas actuales de la recepción"
            );
        }

        Map<Long, Integer> cantidadesOrdenadas =
                consultarCantidadesOrden(recepcion.getIdOrden());

        for (EditarRecepcionRequest.DetalleRequest linea : request.detalles()) {
            Integer cantidadOrdenada =
                    cantidadesOrdenadas.get(linea.productoId());

            if (cantidadOrdenada == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "El producto " + linea.productoId()
                                + " no pertenece a la orden vinculada"
                );
            }

            if (linea.cantidadRecibida() > cantidadOrdenada) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "La cantidad recibida del producto "
                                + linea.productoId()
                                + " supera la cantidad ordenada ("
                                + cantidadOrdenada + ")"
                );
            }
        }

        recepcion.setFecha(request.fecha());
        recepcion.setAlmacen(request.almacen().trim());

        String observacion = request.observacion();
        recepcion.setObservacion(
                observacion == null || observacion.isBlank()
                        ? null
                        : observacion.trim()
        );

        for (EditarRecepcionRequest.DetalleRequest linea : request.detalles()) {
            DetalleRecepcion detalle =
                    detallesPorId.get(linea.idDetalle());

            detalle.setProductoId(linea.productoId());
            detalle.setCantidadRecibida(linea.cantidadRecibida());
        }

        Recepcion guardada =
                recepcionRepository.saveAndFlush(recepcion);

        List<RecepcionActualizadaResponse.DetalleResponse> detallesResponse =
                detallesExistentes.stream()
                        .map(detalle ->
                                new RecepcionActualizadaResponse.DetalleResponse(
                                        detalle.getIdDetalle(),
                                        detalle.getProductoId(),
                                        detalle.getCantidadRecibida()
                                )
                        )
                        .toList();

        return new RecepcionActualizadaResponse(
                guardada.getIdRecepcion(),
                guardada.getIdOrden(),
                guardada.getEstado(),
                guardada.getFecha(),
                guardada.getAlmacen(),
                guardada.getObservacion(),
                detallesResponse
        );
    }

    private Map<Long, Integer> consultarCantidadesOrden(Long idOrden) {
        String url = ordenesBaseUrl
                + "/api/ordenes-compra/"
                + idOrden;

        try {
            OrdenCompraApi orden =
                    restTemplate.getForObject(url, OrdenCompraApi.class);

            if (orden == null || orden.detalles() == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Órdenes devolvió una respuesta inválida"
                );
            }

            Map<Long, Integer> cantidades = new HashMap<>();

            for (DetalleOrdenApi detalle : orden.detalles()) {
                if (detalle == null
                        || detalle.productoId() == null
                        || detalle.cantidad() == null
                        || detalle.cantidad() <= 0) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_GATEWAY,
                            "Órdenes devolvió una línea inválida"
                    );
                }

                cantidades.merge(
                        detalle.productoId(),
                        detalle.cantidad(),
                        Integer::sum
                );
            }

            return cantidades;
        } catch (HttpClientErrorException.NotFound e) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "La orden vinculada no existe"
            );
        } catch (RestClientException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "No se pudo validar la recepción contra el servicio de Órdenes",
                    e
            );
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record OrdenCompraApi(
            Long idOrden,
            List<DetalleOrdenApi> detalles
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record DetalleOrdenApi(
            Long productoId,
            Integer cantidad
    ) {
    }
}