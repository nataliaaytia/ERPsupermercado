
package com.sonic.erp.cotizaciones.service;

import com.sonic.erp.cotizaciones.dto.request.GenerarSolicitudCotizacionRequest;
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
}
