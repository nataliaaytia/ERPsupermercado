
package com.sonic.erp.cotizaciones.service;

import com.sonic.erp.cotizaciones.dto.request.GenerarSolicitudCotizacionRequest;
import com.sonic.erp.cotizaciones.dto.response.SolicitudCotizacionResponse;
import java.util.List;
import com.sonic.erp.cotizaciones.entity.Requisicion;
import com.sonic.erp.cotizaciones.entity.SolicitudCotizacion;
import com.sonic.erp.cotizaciones.repository.RequisicionRepository;
import com.sonic.erp.cotizaciones.repository.SolicitudCotizacionRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

@Service
public class SolicitudCotizacionService {

    private final RequisicionRepository requisicionRepository;
    private final SolicitudCotizacionRepository solicitudCotizacionRepository;

    public SolicitudCotizacionService(
            RequisicionRepository requisicionRepository,
            SolicitudCotizacionRepository solicitudCotizacionRepository) {

        this.requisicionRepository = requisicionRepository;
        this.solicitudCotizacionRepository = solicitudCotizacionRepository;
    }

    @Transactional
    public Long generar(GenerarSolicitudCotizacionRequest datos) {

        Requisicion requisicion = requisicionRepository
                .findById(datos.idRequisicion())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La requisición no existe"
                ));

        if (!"APROBADA".equalsIgnoreCase(requisicion.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La requisición debe estar aprobada"
            );
        }

        if (datos.fechaLimite().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La fecha límite no puede ser anterior a hoy"
            );
        }

        SolicitudCotizacion solicitud = SolicitudCotizacion.builder()
                .fecha(LocalDate.now())
                .fechaLimite(datos.fechaLimite())
                .estado("GENERADA")
                .requisicion(requisicion)
                .build();

        return solicitudCotizacionRepository
                .save(solicitud)
                .getIdSolicitud();
    }

    @Transactional(readOnly = true)
    public List<SolicitudCotizacionResponse> listar(String estado) {

        List<SolicitudCotizacion> solicitudes;

        if (estado == null || estado.isBlank()) {
            solicitudes = solicitudCotizacionRepository.findAll();
        } else {
            solicitudes = solicitudCotizacionRepository
                    .findByEstadoIgnoreCase(estado.trim());
        }

        return solicitudes.stream()
                .map(this::convertirAResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SolicitudCotizacionResponse obtenerPorId(Long id) {

        SolicitudCotizacion solicitud = solicitudCotizacionRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La solicitud de cotización no existe"
                ));

        return convertirAResponse(solicitud);
    }

    @Transactional
    public Long cerrar(Long idSolicitud) {

        SolicitudCotizacion solicitud = solicitudCotizacionRepository
                .findById(idSolicitud)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La solicitud de cotización no existe"
                ));

        String estado = solicitud.getEstado();

        if ("CERRADA".equalsIgnoreCase(estado)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La solicitud de cotización ya está cerrada"
            );
        }

        if (!"GENERADA".equalsIgnoreCase(estado)
                && !"ENVIADA".equalsIgnoreCase(estado)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La solicitud no puede cerrarse en su estado actual"
            );
        }

        solicitud.setEstado("CERRADA");

        return solicitudCotizacionRepository
                .save(solicitud)
                .getIdSolicitud();
    }

    private SolicitudCotizacionResponse convertirAResponse(
            SolicitudCotizacion solicitud) {

        Long idRequisicion = solicitud.getRequisicion() != null
                ? solicitud.getRequisicion().getIdRequisicion()
                : null;

        return new SolicitudCotizacionResponse(
                solicitud.getIdSolicitud(),
                idRequisicion,
                solicitud.getFecha(),
                solicitud.getFechaLimite(),
                solicitud.getEstado()
        );
    }


}
