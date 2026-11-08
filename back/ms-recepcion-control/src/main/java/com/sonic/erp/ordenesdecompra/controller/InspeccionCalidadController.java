package com.sonic.erp.ordenesdecompra.controller;

import com.sonic.erp.ordenesdecompra.dto.request.RegistrarInspeccionRequest;
import com.sonic.erp.ordenesdecompra.dto.response.InspeccionResponse;
import com.sonic.erp.ordenesdecompra.service.InspeccionCalidadService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inspecciones")
@CrossOrigin(origins = "*")
public class InspeccionCalidadController {

    private final InspeccionCalidadService inspeccionCalidadService;

    public InspeccionCalidadController(InspeccionCalidadService inspeccionCalidadService) {
        this.inspeccionCalidadService = inspeccionCalidadService;
    }

    @PostMapping
    public ResponseEntity<?> registrarInspeccion(@Valid @RequestBody RegistrarInspeccionRequest request) {
        try {
            InspeccionResponse response = inspeccionCalidadService.registrarInspeccion(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}