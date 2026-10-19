
package com.sonic.erp.cotizaciones.service;

import com.sonic.erp.cotizaciones.entity.SolicitudCotizacion;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.ZoneId;

@Service
public class FechaLimiteCotizacionService {

    public void validarVigencia(SolicitudCotizacion solicitud) {

        if (solicitud == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La solicitud de cotización es obligatoria"
            );
        }

        if (solicitud.getFechaLimite() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La solicitud de cotización no tiene fecha límite"
            );
        }

        LocalDate hoy = LocalDate.now(
                ZoneId.of("America/La_Paz")
        );

        if (hoy.isAfter(solicitud.getFechaLimite())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No se pueden registrar ofertas porque la solicitud de cotización ha vencido"
            );
        }
    }
}
