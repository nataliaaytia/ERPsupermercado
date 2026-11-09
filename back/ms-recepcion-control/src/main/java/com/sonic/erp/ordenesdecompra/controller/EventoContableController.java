package com.sonic.erp.ordenesdecompra.controller;

import com.sonic.erp.ordenesdecompra.dto.request.ConfirmarOrdenContabilidadRequest;
import com.sonic.erp.ordenesdecompra.dto.response.CompromisoContableResponse;
import com.sonic.erp.ordenesdecompra.service.CompromisoContableService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ordenes-confirmadas")
@CrossOrigin(origins = "*")
public class EventoContableController {

    private final CompromisoContableService compromisoService;

    public EventoContableController(CompromisoContableService compromisoService) {
        this.compromisoService = compromisoService;
    }

    @PostMapping("/enviar-contabilidad")
    public ResponseEntity<?> enviarAContabilidad(@Valid @RequestBody ConfirmarOrdenContabilidadRequest request) {
        try {
            CompromisoContableResponse response = compromisoService.registrarYPublicarCompromiso(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}