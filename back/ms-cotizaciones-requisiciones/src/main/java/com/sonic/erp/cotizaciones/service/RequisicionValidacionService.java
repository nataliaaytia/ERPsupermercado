
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

        if (idRequisicion == null || idRequisicion <= 0) {
            throw new ResponseStatusException(
                    BAD_REQUEST,
                    "El identificador de la requisición debe ser positivo."
            );
        }

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

        Requisicion requisicion = requisicionRepository
                .findById(idRequisicion)
                .orElseThrow(() -> new ResponseStatusException(
                        NOT_FOUND,
                        "No se encontró la requisición con ID " + idRequisicion
                ));

        if (!"PENDIENTE".equalsIgnoreCase(requisicion.getEstado())) {
            throw new ResponseStatusException(
                    CONFLICT,
                    "Solo se puede cambiar la prioridad de una requisición pendiente."
            );
        }

        requisicion.setPrioridad(prioridadNormalizada);
        Requisicion guardada = requisicionRepository.save(requisicion);

        return Map.of(
                "mensaje", "La prioridad se actualizó correctamente.",
                "idRequisicion", guardada.getIdRequisicion(),
                "prioridad", guardada.getPrioridad()
        );
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
