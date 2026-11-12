package com.sonic.erp.ordenesdecompra.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sonic.erp.ordenesdecompra.entity.DetalleRecepcion;
import com.sonic.erp.ordenesdecompra.entity.Discrepancia;
import com.sonic.erp.ordenesdecompra.entity.Devolucion;
import com.sonic.erp.ordenesdecompra.entity.Recepcion;
import com.sonic.erp.ordenesdecompra.repository.DiscrepanciaRepository;
import com.sonic.erp.ordenesdecompra.repository.DevolucionRepository;
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
import java.util.List;
import java.util.Map;

@Service
public class CoordinacionCierreOrdenService {

    private final RecepcionRepository recepcionRepository;
    private final DiscrepanciaRepository discrepanciaRepository;
    private final DevolucionRepository devolucionRepository;
    private final RestTemplate restTemplate;
    private final String ordenesBaseUrl;

    public CoordinacionCierreOrdenService(
            RecepcionRepository recepcionRepository,
            DiscrepanciaRepository discrepanciaRepository,
            DevolucionRepository devolucionRepository,
            RestTemplate restTemplate,
            @Value("${servicios.ordenes-compra.base-url:http://localhost:8081}")
            String ordenesBaseUrl) {

        this.recepcionRepository = recepcionRepository;
        this.discrepanciaRepository = discrepanciaRepository;
        this.devolucionRepository = devolucionRepository;
        this.restTemplate = restTemplate;
        this.ordenesBaseUrl = ordenesBaseUrl;
    }

    @Transactional(readOnly = true)
    public RespuestaCierreOrden coordinarCierre(
            Long idOrden,
            String responsable) {

        if (idOrden == null || idOrden <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El identificador de la orden no es válido"
            );
        }

        if (responsable == null || responsable.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe indicar el responsable del cierre"
            );
        }

        String responsableLimpio = responsable.trim();

        if (responsableLimpio.length() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El responsable no puede superar 100 caracteres"
            );
        }

        OrdenCompraApi orden = consultarOrden(idOrden);

        if (orden.detalles() == null || orden.detalles().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Órdenes devolvió una orden sin detalles"
            );
        }

        Map<Long, Integer> cantidadesOrdenadas = new HashMap<>();

        for (DetalleOrdenApi detalle : orden.detalles()) {
            if (detalle == null
                    || detalle.productoId() == null
                    || detalle.cantidad() == null
                    || detalle.cantidad() <= 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Órdenes devolvió una línea de orden inválida"
                );
            }

            cantidadesOrdenadas.merge(
                    detalle.productoId(),
                    detalle.cantidad(),
                    Integer::sum
            );
        }

        Map<Long, Integer> cantidadesAceptadas = new HashMap<>();
        List<String> bloqueos = new ArrayList<>();

        if (recepcionRepository.existsByIdOrdenIsNull()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede validar el cierre: existen recepciones sin orden vinculada"
            );
        }

        List<Recepcion> recepciones =
                recepcionRepository.findByIdOrden(idOrden);

        for (Recepcion recepcion : recepciones) {
            if (recepcion.getDetalles() == null) {
                continue;
            }

            for (DetalleRecepcion detalle : recepcion.getDetalles()) {
                Long idDetalle = detalle.getIdDetalle();

                boolean inspeccionado =
                        detalle.getInspecciones() != null
                                && !detalle.getInspecciones().isEmpty();

                if (inspeccionado && detalle.getProductoId() != null) {
                    int aceptada = detalle.getCantidadAceptada() == null
                            ? 0
                            : detalle.getCantidadAceptada();

                    cantidadesAceptadas.merge(
                            detalle.getProductoId(),
                            aceptada,
                            Integer::sum
                    );
                }

                List<Discrepancia> discrepancias =
                        discrepanciaRepository
                                .findByDetalleRecepcionIdDetalle(idDetalle);

                boolean tieneDiscrepanciaPendiente = discrepancias.stream()
                        .anyMatch(discrepancia ->
                                "PENDIENTE_RESOLUCION".equalsIgnoreCase(
                                        discrepancia.getEstado()
                                )
                        );

                if (tieneDiscrepanciaPendiente) {
                    bloqueos.add(
                            "El detalle " + idDetalle
                                    + " tiene discrepancias pendientes"
                    );
                }

                List<Devolucion> devoluciones =
                        devolucionRepository
                                .findByDetalleRecepcionIdDetalle(idDetalle);

                boolean tieneDevolucionPendiente = devoluciones.stream()
                        .anyMatch(devolucion ->
                                "GENERADA".equalsIgnoreCase(
                                        devolucion.getEstado()
                                )
                        );

                if (tieneDevolucionPendiente) {
                    bloqueos.add(
                            "El detalle " + idDetalle
                                    + " tiene devoluciones pendientes"
                    );
                }
            }
        }

        for (Map.Entry<Long, Integer> linea : cantidadesOrdenadas.entrySet()) {
            int ordenada = linea.getValue();
            int aceptada = cantidadesAceptadas.getOrDefault(
                    linea.getKey(),
                    0
            );

            if (aceptada != ordenada) {
                bloqueos.add(
                        "Producto " + linea.getKey()
                                + ": ordenada " + ordenada
                                + ", aceptada " + aceptada
                );
            }
        }

        if (!bloqueos.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede cerrar la orden: "
                            + String.join("; ", bloqueos)
            );
        }

        return cerrarEnServicioOrdenes(idOrden, responsableLimpio);
    }

    private OrdenCompraApi consultarOrden(Long idOrden) {
        String url = ordenesBaseUrl
                + "/api/ordenes-compra/"
                + idOrden;

        try {
            OrdenCompraApi orden =
                    restTemplate.getForObject(url, OrdenCompraApi.class);

            if (orden == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Órdenes devolvió una respuesta vacía"
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

    private RespuestaCierreOrden cerrarEnServicioOrdenes(
            Long idOrden,
            String responsable) {

        String url = ordenesBaseUrl
                + "/api/ordenes-compra/"
                + idOrden
                + "/cerrar";

        try {
            RespuestaCierreOrden respuesta =
                    restTemplate.postForObject(
                            url,
                            new SolicitudCierreOrdenApi(responsable),
                            RespuestaCierreOrden.class
                    );

            if (respuesta == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Órdenes no devolvió la confirmación del cierre"
                );
            }

            return respuesta;
        } catch (HttpClientErrorException.Conflict e) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Órdenes no permitió cerrar la orden: "
                            + e.getResponseBodyAsString(),
                    e
            );
        } catch (RestClientException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "No se pudo completar el cierre en el servicio de Órdenes",
                    e
            );
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record OrdenCompraApi(
            Long idOrden,
            String numero,
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

    public record SolicitudCierreOrdenApi(String responsable) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record RespuestaCierreOrden(
            Long idOrden,
            String numero,
            String estado,
            String responsable,
            java.time.LocalDateTime fechaCierre
    ) {
    }
}