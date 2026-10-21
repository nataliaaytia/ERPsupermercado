
package com.sonic.erp.cotizaciones.controller;

import com.sonic.erp.cotizaciones.dto.request.GenerarSolicitudCotizacionRequest;
import com.sonic.erp.cotizaciones.service.SolicitudCotizacionService;
import com.sonic.erp.cotizaciones.dto.response.SolicitudCotizacionResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.List;

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

    @GetMapping
    public ResponseEntity<List<SolicitudCotizacionResponse>> listar(
            @RequestParam(required = false) String estado) {

        return ResponseEntity.ok(
                solicitudCotizacionService.listar(estado)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<SolicitudCotizacionResponse> obtenerPorId(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                solicitudCotizacionService.obtenerPorId(id)
        );
    }

    @PatchMapping("/{idSolicitud}/cerrar")
    public ResponseEntity<Map<String, Object>> cerrar(
            @PathVariable Long idSolicitud) {

        Long idCerrado = solicitudCotizacionService.cerrar(idSolicitud);

        return ResponseEntity.ok(Map.of(
                "mensaje", "Solicitud de cotización cerrada correctamente",
                "idSolicitud", idCerrado,
                "estado", "CERRADA"
        ));
    }

}
