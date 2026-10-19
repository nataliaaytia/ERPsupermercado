
package com.sonic.erp.cotizaciones.controller;

import com.sonic.erp.cotizaciones.dto.request.GenerarSolicitudCotizacionRequest;
import com.sonic.erp.cotizaciones.service.SolicitudCotizacionService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/solicitudes-cotizacion")
public class SolicitudCotizacionController {

    private final SolicitudCotizacionService solicitudCotizacionService;

    public SolicitudCotizacionController(
            SolicitudCotizacionService solicitudCotizacionService) {
        this.solicitudCotizacionService = solicitudCotizacionService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> generar(
            @Valid @RequestBody GenerarSolicitudCotizacionRequest datos) {

        Long idSolicitud = solicitudCotizacionService.generar(datos);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(Map.of(
                        "mensaje", "Solicitud de cotización generada correctamente",
                        "idSolicitud", idSolicitud
                ));
    }
}
