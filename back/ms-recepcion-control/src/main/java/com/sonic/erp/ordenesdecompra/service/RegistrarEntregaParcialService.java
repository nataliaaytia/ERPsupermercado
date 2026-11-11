package com.sonic.erp.ordenesdecompra.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sonic.erp.ordenesdecompra.dto.request.RegistrarEntregaParcialRequest;
import com.sonic.erp.ordenesdecompra.dto.response.EntregaParcialResponse;
import com.sonic.erp.ordenesdecompra.entity.DetalleRecepcion;
import com.sonic.erp.ordenesdecompra.entity.Recepcion;
import com.sonic.erp.ordenesdecompra.repository.RecepcionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class RegistrarEntregaParcialService {

    private final RecepcionRepository recepcionRepository;
    private final RestTemplate restTemplate;
    private final String ordenesBaseUrl;

    public RegistrarEntregaParcialService(
            RecepcionRepository recepcionRepository,
            RestTemplate restTemplate,
            @Value("${servicios.ordenes-compra.base-url:http://localhost:8081}")
            String ordenesBaseUrl) {
        this.recepcionRepository = recepcionRepository;
        this.restTemplate = restTemplate;
        this.ordenesBaseUrl = ordenesBaseUrl;
    }

    @Transactional
    public EntregaParcialResponse registrar(
            Long idOrden,
            RegistrarEntregaParcialRequest request) {

        if (idOrden == null || idOrden <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El identificador de la orden no es válido"
            );
        }

        if (request == null
                || request.detalles() == null
                || request.detalles().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe incluir al menos una línea de entrega"
            );
        }

        OrdenCompraApi orden = consultarOrden(idOrden);

        if (!"ENVIADA".equalsIgnoreCase(orden.estado())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Solo se pueden registrar entregas para órdenes ENVIADA"
            );
        }

        Map<Long, Integer> cantidadesOrdenadas =
                obtenerCantidadesOrdenadas(orden);

        if (recepcionRepository.existsByIdOrdenIsNull()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede calcular el saldo: existen recepciones sin orden vinculada"
            );
        }

        List<Recepcion> recepcionesAnteriores =
                recepcionRepository.findByIdOrden(idOrden);

        Map<Long, Acumulado> acumulados =
                calcularAcumulados(recepcionesAnteriores);

        Set<Long> productosEnSolicitud = new HashSet<>();

        for (RegistrarEntregaParcialRequest.LineaEntregaRequest linea
                : request.detalles()) {

            if (linea == null
                    || linea.productoId() == null
                    || linea.cantidadRecibida() == null
                    || linea.cantidadRecibida() <= 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Cada línea debe incluir producto y cantidad positiva"
                );
            }

            if (!productosEnSolicitud.add(linea.productoId())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "No se permiten productos duplicados en una entrega"
                );
            }

            Integer cantidadOrdenada =
                    cantidadesOrdenadas.get(linea.productoId());

            if (cantidadOrdenada == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "El producto " + linea.productoId()
                                + " no pertenece a la orden"
                );
            }

            Acumulado acumulado = acumulados.computeIfAbsent(
                    linea.productoId(),
                    productoId -> new Acumulado()
            );

            int pendiente = Math.max(
                    0,
                    cantidadOrdenada
                            - acumulado.cantidadAceptada
                            - acumulado.cantidadEnInspeccion
            );

            if (linea.cantidadRecibida() > pendiente) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Cantidad en conflicto para producto "
                                + linea.productoId()
                                + ": pendiente " + pendiente
                                + ", solicitada " + linea.cantidadRecibida()
                );
            }
        }

        Recepcion nuevaRecepcion = Recepcion.builder()
                .idOrden(idOrden)
                .fecha(request.fecha())
                .almacen(request.almacen().trim())
                .estado("PENDIENTE_INSPECCION")
                .observacion(limpiarObservacion(request.observacion()))
                .build();

        for (RegistrarEntregaParcialRequest.LineaEntregaRequest linea
                : request.detalles()) {

            DetalleRecepcion detalle = DetalleRecepcion.builder()
                    .productoId(linea.productoId())
                    .cantidadRecibida(linea.cantidadRecibida())
                    .cantidadAceptada(0)
                    .build();

            nuevaRecepcion.agregarDetalle(detalle);

            Acumulado acumulado = acumulados.computeIfAbsent(
                    linea.productoId(),
                    productoId -> new Acumulado()
            );
            acumulado.cantidadEnInspeccion += linea.cantidadRecibida();
        }

        Recepcion guardada =
                recepcionRepository.saveAndFlush(nuevaRecepcion);

        List<EntregaParcialResponse.DetalleResponse> detallesResponse =
                guardada.getDetalles().stream()
                        .map(detalle ->
                                new EntregaParcialResponse.DetalleResponse(
                                        detalle.getIdDetalle(),
                                        detalle.getProductoId(),
                                        detalle.getCantidadRecibida()
                                )
                        )
                        .toList();

        List<EntregaParcialResponse.SaldoResponse> saldosResponse =
                construirSaldos(cantidadesOrdenadas, acumulados);

        return new EntregaParcialResponse(
                guardada.getIdRecepcion(),
                guardada.getIdOrden(),
                guardada.getEstado(),
                guardada.getFecha(),
                guardada.getAlmacen(),
                guardada.getObservacion(),
                detallesResponse,
                saldosResponse
        );
    }

    private OrdenCompraApi consultarOrden(Long idOrden) {
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

            return orden;
        } catch (HttpClientErrorException.NotFound e) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "La orden de compra no existe"
            );
        } catch (RestClientException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "No se pudo consultar la orden en el servicio de Órdenes",
                    e
            );
        }
    }

    private Map<Long, Integer> obtenerCantidadesOrdenadas(
            OrdenCompraApi orden) {

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

        if (cantidades.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "La orden no contiene líneas válidas"
            );
        }

        return cantidades;
    }

    private Map<Long, Acumulado> calcularAcumulados(
            List<Recepcion> recepciones) {

        Map<Long, Acumulado> acumulados = new HashMap<>();

        for (Recepcion recepcion : recepciones) {
            if (recepcion.getDetalles() == null) {
                continue;
            }

            String estado = recepcion.getEstado() == null
                    ? ""
                    : recepcion.getEstado().trim().toUpperCase();

            boolean validada =
                    "AUTORIZADA".equals(estado)
                            || "VALIDADA".equals(estado);

            boolean anulada =
                    "ANULADA".equals(estado)
                            || "CANCELADA".equals(estado)
                            || "RECHAZADO_DESPACHO".equals(estado);

            if (anulada) {
                continue;
            }

            for (DetalleRecepcion detalle : recepcion.getDetalles()) {
                if (detalle.getProductoId() == null) {
                    continue;
                }

                Acumulado acumulado = acumulados.computeIfAbsent(
                        detalle.getProductoId(),
                        productoId -> new Acumulado()
                );

                if (validada) {
                    int aceptada = detalle.getCantidadAceptada() == null
                            ? 0
                            : detalle.getCantidadAceptada();
                    acumulado.cantidadAceptada += aceptada;
                } else {
                    int recibida = detalle.getCantidadRecibida() == null
                            ? 0
                            : detalle.getCantidadRecibida();
                    acumulado.cantidadEnInspeccion += recibida;
                }
            }
        }

        return acumulados;
    }

    private List<EntregaParcialResponse.SaldoResponse> construirSaldos(
            Map<Long, Integer> cantidadesOrdenadas,
            Map<Long, Acumulado> acumulados) {

        List<EntregaParcialResponse.SaldoResponse> saldos =
                new ArrayList<>();

        cantidadesOrdenadas.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .forEach(entry -> {
                    Acumulado acumulado = acumulados.getOrDefault(
                            entry.getKey(),
                            new Acumulado()
                    );

                    int pendiente = Math.max(
                            0,
                            entry.getValue()
                                    - acumulado.cantidadAceptada
                                    - acumulado.cantidadEnInspeccion
                    );

                    saldos.add(
                            new EntregaParcialResponse.SaldoResponse(
                                    entry.getKey(),
                                    entry.getValue(),
                                    acumulado.cantidadAceptada,
                                    acumulado.cantidadEnInspeccion,
                                    pendiente
                            )
                    );
                });

        return saldos;
    }

    private String limpiarObservacion(String observacion) {
        if (observacion == null || observacion.isBlank()) {
            return null;
        }
        return observacion.trim();
    }

    private static class Acumulado {
        private int cantidadAceptada;
        private int cantidadEnInspeccion;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record OrdenCompraApi(
            Long idOrden,
            String estado,
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