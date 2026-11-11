package com.sonic.erp.ordenesdecompra.controller;

import com.sonic.erp.ordenesdecompra.dto.request.RegistrarCostoTransporteRequest;
import com.sonic.erp.ordenesdecompra.dto.response.CostoTransporteResponse;
import com.sonic.erp.ordenesdecompra.service.CostoTransporteRecepcionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recepciones/{idRecepcion}/costo-transporte")
@CrossOrigin(origins = "*")
public class CostoTransporteRecepcionController {

    private final CostoTransporteRecepcionService costoService;

    public CostoTransporteRecepcionController(
            CostoTransporteRecepcionService costoService) {
        this.costoService = costoService;
    }

    @PutMapping
    public ResponseEntity<CostoTransporteResponse> registrar(
            @PathVariable Long idRecepcion,
            @Valid @RequestBody RegistrarCostoTransporteRequest request) {
        return ResponseEntity.ok(
                costoService.registrar(idRecepcion, request)
        );
    }

    @GetMapping
    public ResponseEntity<CostoTransporteResponse> consultar(
            @PathVariable Long idRecepcion) {
        return ResponseEntity.ok(
                costoService.consultar(idRecepcion)
        );
    }
}