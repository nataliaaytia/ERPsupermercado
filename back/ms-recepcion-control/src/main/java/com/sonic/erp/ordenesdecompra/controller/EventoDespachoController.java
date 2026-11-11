package com.sonic.erp.ordenesdecompra.controller;

import com.sonic.erp.ordenesdecompra.dto.request.ConfirmarDisponibilidadRequest;
import com.sonic.erp.ordenesdecompra.dto.response.DisponibilidadDespachoResponse;
import com.sonic.erp.ordenesdecompra.service.EventoDisponibilidadService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/disponibilidad-despachos")
@CrossOrigin(origins = "*")
public class EventoDespachoController {

    private final EventoDisponibilidadService disponibilidadService;

    public EventoDespachoController(EventoDisponibilidadService disponibilidadService) {
        this.disponibilidadService = disponibilidadService;
    }

    @PostMapping("/notificar")
    public ResponseEntity<?> notificarDisponibilidad(@Valid @RequestBody ConfirmarDisponibilidadRequest request) {
        try {
            DisponibilidadDespachoResponse response = disponibilidadService.notificarDisponibilidad(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}