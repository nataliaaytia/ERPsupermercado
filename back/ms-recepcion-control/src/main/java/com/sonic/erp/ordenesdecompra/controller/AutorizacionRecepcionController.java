package com.sonic.erp.ordenesdecompra.controller;

import com.sonic.erp.ordenesdecompra.dto.request.ConfirmarAutorizacionRequest;
import com.sonic.erp.ordenesdecompra.dto.response.AutorizacionRecepcionResponse;
import com.sonic.erp.ordenesdecompra.service.AutorizacionRecepcionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/autorizaciones-recepcion")
@CrossOrigin(origins = "*")
public class AutorizacionRecepcionController {

    private final AutorizacionRecepcionService autorizacionRecepcionService;

    public AutorizacionRecepcionController(AutorizacionRecepcionService autorizacionRecepcionService) {
        this.autorizacionRecepcionService = autorizacionRecepcionService;
    }

    @PostMapping("/confirmar")
    public ResponseEntity<?> confirmarAutorizacion(@Valid @RequestBody ConfirmarAutorizacionRequest request) {
        try {
            AutorizacionRecepcionResponse response = autorizacionRecepcionService.confirmarAutorizacion(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/recepcion/{idRecepcion}")
    public ResponseEntity<?> consultarResultado(@PathVariable Long idRecepcion) {
        try {
            AutorizacionRecepcionResponse response = autorizacionRecepcionService.consultarResultado(idRecepcion);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}