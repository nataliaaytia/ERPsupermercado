package com.sonic.erp.ordenesdecompra.controller;

import com.sonic.erp.ordenesdecompra.dto.request.RegistrarDiscrepanciaRequest;
import com.sonic.erp.ordenesdecompra.dto.response.DiscrepanciaResponse;
import com.sonic.erp.ordenesdecompra.service.DiscrepanciaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discrepancias")
@CrossOrigin(origins = "*")
public class DiscrepanciaController {

    private final DiscrepanciaService discrepanciaService;

    public DiscrepanciaController(DiscrepanciaService discrepanciaService) {
        this.discrepanciaService = discrepanciaService;
    }

    @PostMapping
    public ResponseEntity<?> registrarDiscrepancia(@Valid @RequestBody RegistrarDiscrepanciaRequest request) {
        try {
            DiscrepanciaResponse response = discrepanciaService.registrarDiscrepancia(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/detalle/{idDetalle}")
    public ResponseEntity<List<DiscrepanciaResponse>> listarPorDetalle(@PathVariable Long idDetalle) {
        return ResponseEntity.ok(discrepanciaService.listarPorDetalle(idDetalle));
    }
}