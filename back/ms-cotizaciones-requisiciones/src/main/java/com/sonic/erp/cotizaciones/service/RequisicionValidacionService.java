
package com.sonic.erp.cotizaciones.service;

import com.sonic.erp.cotizaciones.entity.DetalleRequisicion;
import com.sonic.erp.cotizaciones.entity.Requisicion;
import com.sonic.erp.cotizaciones.repository.RequisicionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
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

    public RequisicionValidacionService(
            RequisicionRepository requisicionRepository) {
        this.requisicionRepository = requisicionRepository;
    }

    @Transactional(readOnly = true)
    public List<String> validarPorId(Long idRequisicion) {

        if (idRequisicion == null || idRequisicion <= 0) {
            throw new ResponseStatusException(
                    BAD_REQUEST,
                    "El identificador de la requisición debe ser positivo."
            );
        }

        Requisicion requisicion = requisicionRepository
                .findById(idRequisicion)
                .orElseThrow(() -> new ResponseStatusException(
                        NOT_FOUND,
                        "No se encontró la requisición con ID " + idRequisicion
                ));

        return validar(requisicion);
    }

    @Transactional
    public Map<String, Object> actualizarPrioridad(
            Long idRequisicion,
            String nuevaPrioridad) {

        validarId(idRequisicion);

        if (nuevaPrioridad == null || nuevaPrioridad.isBlank()) {
            throw new ResponseStatusException(
                    BAD_REQUEST,
                    "La prioridad es obligatoria."
            );
        }

        String prioridadNormalizada =
                nuevaPrioridad.trim().toUpperCase();

        if (!PRIORIDADES_VALIDAS.contains(prioridadNormalizada)) {
            throw new ResponseStatusException(
                    BAD_REQUEST,
                    "La prioridad debe ser ALTA, MEDIA o BAJA."
            );
        }

        Requisicion requisicion = buscarRequisicion(idRequisicion);
        exigirEstadoPendiente(requisicion);

        requisicion.setPrioridad(prioridadNormalizada);
        Requisicion guardada = requisicionRepository.save(requisicion);

        return Map.of(
                "mensaje", "La prioridad se actualizó correctamente.",
                "idRequisicion", guardada.getIdRequisicion(),
                "prioridad", guardada.getPrioridad()
        );
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
        validarId(idRequisicion);

        Requisicion requisicion = buscarRequisicion(idRequisicion);
        exigirEstadoPendiente(requisicion);

        requisicion.setEstado("ANULADA");
        Requisicion guardada = requisicionRepository.save(requisicion);

        return Map.of(
                "mensaje", "La requisición se canceló correctamente.",
                "idRequisicion", guardada.getIdRequisicion(),
                "estado", guardada.getEstado()
        );
    }

    private Map<String, Object> cambiarEstado(
            Long idRequisicion,
            String nuevoEstado,
            String mensaje) {

        validarId(idRequisicion);

        Requisicion requisicion = buscarRequisicion(idRequisicion);
        exigirEstadoPendiente(requisicion);

        requisicion.setEstado(nuevoEstado);
        Requisicion guardada = requisicionRepository.save(requisicion);

        return Map.of(
                "mensaje", mensaje,
                "idRequisicion", guardada.getIdRequisicion(),
                "estado", guardada.getEstado()
        );
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
