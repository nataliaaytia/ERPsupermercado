
package com.sonic.erp.cotizaciones.service;

import com.sonic.erp.cotizaciones.entity.DetalleRequisicion;
import com.sonic.erp.cotizaciones.entity.HistorialRequisicion;
import com.sonic.erp.cotizaciones.entity.Requisicion;
import com.sonic.erp.cotizaciones.repository.HistorialRequisicionRepository;
import com.sonic.erp.cotizaciones.repository.RequisicionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.CONFLICT;

@Service
public class RequisicionValidacionService {

    private static final List<String> PRIORIDADES_VALIDAS =
            List.of("ALTA", "MEDIA", "BAJA");

    private final RequisicionRepository requisicionRepository;
    private final HistorialRequisicionRepository historialRepository;

    public RequisicionValidacionService(
            RequisicionRepository requisicionRepository,
            HistorialRequisicionRepository historialRepository) {
        this.requisicionRepository = requisicionRepository;
        this.historialRepository = historialRepository;
    }

    @Transactional(readOnly = true)
    public List<String> validarPorId(Long idRequisicion) {
        validarId(idRequisicion);
        return validar(buscarRequisicion(idRequisicion));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> consultarPorId(Long idRequisicion) {
        validarId(idRequisicion);

        Requisicion requisicion = buscarRequisicion(idRequisicion);

        Map<String, Object> respuesta = new LinkedHashMap<>();
        respuesta.put("idRequisicion", requisicion.getIdRequisicion());
        respuesta.put("fecha", requisicion.getFecha());
        respuesta.put("prioridad", requisicion.getPrioridad());
        respuesta.put("estado", requisicion.getEstado());
        respuesta.put("solicitante", requisicion.getSolicitante());
        respuesta.put("observacion", requisicion.getObservacion());
        respuesta.put("detalles", requisicion.getDetalles());

        return respuesta;
    }

    @Transactional(readOnly = true)
    public List<HistorialRequisicion> consultarHistorial(
            Long idRequisicion) {

        validarId(idRequisicion);
        buscarRequisicion(idRequisicion);

        return historialRepository
                .findByIdRequisicionOrderByFechaCambioDesc(idRequisicion);
    }

    @Transactional
    public Map<String, Object> actualizarPrioridad(
            Long idRequisicion,
            String nuevaPrioridad) {

        validarId(idRequisicion);

        if (nuevaPrioridad == null || nuevaPrioridad.isBlank()) {
            throw new ResponseStatusException(
                    BAD_REQUEST, "La prioridad es obligatoria.");
        }

        String prioridadNormalizada =
                nuevaPrioridad.trim().toUpperCase();

        if (!PRIORIDADES_VALIDAS.contains(prioridadNormalizada)) {
            throw new ResponseStatusException(
                    BAD_REQUEST,
                    "La prioridad debe ser ALTA, MEDIA o BAJA.");
        }

        Requisicion requisicion = buscarRequisicion(idRequisicion);
        exigirEstadoPendiente(requisicion);

        String prioridadAnterior = requisicion.getPrioridad();

        requisicion.setPrioridad(prioridadNormalizada);
        Requisicion guardada = requisicionRepository.save(requisicion);

        if (!prioridadNormalizada.equals(prioridadAnterior)) {
            registrarCambio(
                    idRequisicion,
                    "PRIORIDAD",
                    prioridadAnterior,
                    prioridadNormalizada
            );
        }

        Map<String, Object> respuesta = new LinkedHashMap<>();
        respuesta.put("mensaje", "La prioridad se actualizó correctamente.");
        respuesta.put("idRequisicion", guardada.getIdRequisicion());
        respuesta.put("prioridad", guardada.getPrioridad());
        return respuesta;
    }

    @Transactional
    public Map<String, Object> aprobar(Long idRequisicion) {
        return cambiarEstado(
                idRequisicion,
                "APROBADA",
                "La requisición se aprobó correctamente."
        );
    }

    @Transactional
    public Map<String, Object> rechazar(Long idRequisicion) {
        return cambiarEstado(
                idRequisicion,
                "RECHAZADA",
                "La requisición se rechazó correctamente."
        );
    }

    @Transactional
    public Map<String, Object> cancelar(Long idRequisicion) {
        return cambiarEstado(
                idRequisicion,
                "ANULADA",
                "La requisición se canceló correctamente."
        );
    }

    private Map<String, Object> cambiarEstado(
            Long idRequisicion,
            String nuevoEstado,
            String mensaje) {

        validarId(idRequisicion);

        Requisicion requisicion = buscarRequisicion(idRequisicion);
        exigirEstadoPendiente(requisicion);

        String estadoAnterior = requisicion.getEstado();

        requisicion.setEstado(nuevoEstado);
        Requisicion guardada = requisicionRepository.save(requisicion);

        registrarCambio(
                idRequisicion,
                "ESTADO",
                estadoAnterior,
                nuevoEstado
        );

        Map<String, Object> respuesta = new LinkedHashMap<>();
        respuesta.put("mensaje", mensaje);
        respuesta.put("idRequisicion", guardada.getIdRequisicion());
        respuesta.put("estado", guardada.getEstado());
        return respuesta;
    }

    private void registrarCambio(
            Long idRequisicion,
            String tipoCambio,
            String valorAnterior,
            String valorNuevo) {

        HistorialRequisicion historial = HistorialRequisicion.builder()
                .idRequisicion(idRequisicion)
                .tipoCambio(tipoCambio)
                .valorAnterior(valorAnterior)
                .valorNuevo(valorNuevo)
                .fechaCambio(LocalDateTime.now())
                .build();

        historialRepository.save(historial);
    }

    private void validarId(Long idRequisicion) {
        if (idRequisicion == null || idRequisicion <= 0) {
            throw new ResponseStatusException(
                    BAD_REQUEST,
                    "El identificador de la requisición debe ser positivo."
            );
        }
    }

    private Requisicion buscarRequisicion(Long idRequisicion) {
        return requisicionRepository
                .findById(idRequisicion)
                .orElseThrow(() -> new ResponseStatusException(
                        NOT_FOUND,
                        "No se encontró la requisición con ID " + idRequisicion
                ));
    }

    private void exigirEstadoPendiente(Requisicion requisicion) {
        if (!"PENDIENTE".equalsIgnoreCase(requisicion.getEstado())) {
            throw new ResponseStatusException(
                    CONFLICT,
                    "Solo se pueden modificar requisiciones pendientes."
            );
        }
    }

    public List<String> validar(Requisicion requisicion) {
        List<String> errores = new ArrayList<>();

        if (requisicion == null) {
            errores.add("La requisición es obligatoria");
            return errores;
        }

        if (requisicion.getFecha() == null) {
            errores.add("La fecha de la requisición es obligatoria");
        }

        if (requisicion.getSolicitante() == null
                || requisicion.getSolicitante().isBlank()) {
            errores.add("El solicitante es obligatorio");
        }

        String prioridad = requisicion.getPrioridad();

        if (prioridad == null || prioridad.isBlank()) {
            errores.add("La prioridad es obligatoria");
        } else if (!PRIORIDADES_VALIDAS.contains(
                prioridad.trim().toUpperCase())) {
            errores.add("La prioridad debe ser ALTA, MEDIA o BAJA");
        }

        List<DetalleRequisicion> detalles = requisicion.getDetalles();

        if (detalles == null || detalles.isEmpty()) {
            errores.add(
                    "La requisición debe contener al menos un detalle"
            );
            return errores;
        }

        for (int i = 0; i < detalles.size(); i++) {
            DetalleRequisicion detalle = detalles.get(i);
            int numero = i + 1;

            if (detalle == null) {
                errores.add("El detalle " + numero + " es obligatorio");
                continue;
            }

            if (detalle.getProductoId() == null
                    || detalle.getProductoId() <= 0) {
                errores.add(
                        "El producto del detalle " + numero
                                + " debe tener un identificador válido"
                );
            }

            if (detalle.getCantidad() == null
                    || detalle.getCantidad() <= 0) {
                errores.add(
                        "La cantidad del detalle " + numero
                                + " debe ser mayor que cero"
                );
            }
        }

        return errores;
    }
}
