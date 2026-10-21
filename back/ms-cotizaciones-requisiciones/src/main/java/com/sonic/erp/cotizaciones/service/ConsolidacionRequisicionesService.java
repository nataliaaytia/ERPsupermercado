package com.sonic.erp.cotizaciones.service;

import com.sonic.erp.cotizaciones.dto.request.ConsolidarRequisicionesRequest;
import com.sonic.erp.cotizaciones.entity.ConsolidacionRequisiciones;
import com.sonic.erp.cotizaciones.entity.DetalleConsolidacion;
import com.sonic.erp.cotizaciones.entity.DetalleRequisicion;
import com.sonic.erp.cotizaciones.entity.Requisicion;
import com.sonic.erp.cotizaciones.entity.SolicitudCotizacion;
import com.sonic.erp.cotizaciones.repository.ConsolidacionRequisicionesRepository;
import com.sonic.erp.cotizaciones.repository.RequisicionRepository;
import com.sonic.erp.cotizaciones.repository.SolicitudCotizacionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ConsolidacionRequisicionesService {

    private final RequisicionRepository requisicionRepository;
    private final ConsolidacionRequisicionesRepository consolidacionRepository;
    private final SolicitudCotizacionRepository solicitudRepository;

    public ConsolidacionRequisicionesService(
            RequisicionRepository requisicionRepository,
            ConsolidacionRequisicionesRepository consolidacionRepository,
            SolicitudCotizacionRepository solicitudRepository) {

        this.requisicionRepository = requisicionRepository;
        this.consolidacionRepository = consolidacionRepository;
        this.solicitudRepository = solicitudRepository;
    }

    @Transactional
    public Map<String, Object> consolidar(
            ConsolidarRequisicionesRequest datos) {

        if (datos == null
                || datos.idsRequisiciones() == null
                || datos.idsRequisiciones().size() < 2) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe seleccionar al menos dos requisiciones."
            );
        }

        List<Long> ids = datos.idsRequisiciones();

        if (ids.stream().anyMatch(id -> id == null || id <= 0)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Todos los identificadores deben ser positivos."
            );
        }

        if (ids.stream().distinct().count() != ids.size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No se permiten requisiciones repetidas."
            );
        }

        if (datos.fechaLimite() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La fecha límite es obligatoria."
            );
        }

        if (datos.fechaLimite().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La fecha límite no puede ser anterior a hoy."
            );
        }

        List<Requisicion> requisiciones = new ArrayList<>();

        for (Long id : ids) {
            Requisicion requisicion = requisicionRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "No existe la requisición con ID " + id
                    ));

            if (!"APROBADA".equalsIgnoreCase(requisicion.getEstado())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La requisición " + id + " no está aprobada."
                );
            }

            if (requisicion.getDetalles() == null
                    || requisicion.getDetalles().isEmpty()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La requisición " + id + " no contiene productos."
                );
            }

            requisiciones.add(requisicion);
        }

        // Agrupar productos y sumar sus cantidades.
        Map<Long, Integer> cantidadesPorProducto = new LinkedHashMap<>();

        for (Requisicion requisicion : requisiciones) {
            for (DetalleRequisicion detalle : requisicion.getDetalles()) {

                if (detalle.getProductoId() == null
                        || detalle.getProductoId() <= 0
                        || detalle.getCantidad() == null
                        || detalle.getCantidad() <= 0) {

                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "La requisición " + requisicion.getIdRequisicion()
                                    + " contiene un producto o cantidad inválidos."
                    );
                }

                Long productoId = detalle.getProductoId();
                int cantidad = detalle.getCantidad();

                try {
                    cantidadesPorProducto.merge(
                            productoId,
                            cantidad,
                            Math::addExact
                    );
                } catch (ArithmeticException ex) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "La suma de cantidades supera el límite permitido "
                                    + "para el producto " + productoId + "."
                    );
                }
            }
        }

        ConsolidacionRequisiciones consolidacion =
                ConsolidacionRequisiciones.builder()
                        .fecha(LocalDate.now())
                        .estado("GENERADA")
                        .requisiciones(new ArrayList<>(requisiciones))
                        .detalles(new ArrayList<>())
                        .build();

        for (Map.Entry<Long, Integer> entrada
                : cantidadesPorProducto.entrySet()) {

            DetalleConsolidacion detalle = DetalleConsolidacion.builder()
                    .productoId(entrada.getKey())
                    .cantidad(entrada.getValue())
                    .consolidacion(consolidacion)
                    .build();

            consolidacion.getDetalles().add(detalle);
        }

        ConsolidacionRequisiciones guardada =
                consolidacionRepository.save(consolidacion);

        // Crear la solicitud vinculada a la consolidación.
        SolicitudCotizacion solicitud = SolicitudCotizacion.builder()
                .fecha(LocalDate.now())
                .fechaLimite(datos.fechaLimite())
                .estado("GENERADA")
                .requisicion(null)
                .consolidacion(guardada)
                .build();

        SolicitudCotizacion solicitudGuardada =
                solicitudRepository.save(solicitud);

        Map<String, Object> respuesta = new LinkedHashMap<>();
        respuesta.put(
                "mensaje",
                "Consolidación y solicitud de cotización creadas correctamente."
        );
        respuesta.put("idConsolidacion", guardada.getIdConsolidacion());
        respuesta.put("idSolicitud", solicitudGuardada.getIdSolicitud());
        respuesta.put("idsRequisiciones", ids);
        respuesta.put("cantidadProductos", guardada.getDetalles().size());
        respuesta.put("fechaLimite", solicitudGuardada.getFechaLimite());
        respuesta.put("estadoSolicitud", solicitudGuardada.getEstado());

        List<Map<String, Object>> productos = guardada.getDetalles()
                .stream()
                .map(detalle -> {
                    Map<String, Object> producto = new LinkedHashMap<>();
                    producto.put("productoId", detalle.getProductoId());
                    producto.put("cantidad", detalle.getCantidad());
                    return producto;
                })
                .toList();

        respuesta.put("productos", productos);

        return respuesta;
    }
}