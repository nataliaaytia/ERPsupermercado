package com.sonic.erp.ordenesdecompra.controller;

import com.sonic.erp.ordenesdecompra.dto.request.CondicionesLogisticasRequest;
import com.sonic.erp.ordenesdecompra.dto.response.CondicionesLogisticasResponse;
import com.sonic.erp.ordenesdecompra.service.CondicionesLogisticasService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ordenes-compra/{idOrden}/condiciones-logisticas")
@CrossOrigin(origins = "*")
public class CondicionesLogisticasController {

    private final CondicionesLogisticasService condicionesService;

    public CondicionesLogisticasController(
            CondicionesLogisticasService condicionesService) {
        this.condicionesService = condicionesService;
    }

    @PutMapping
    public ResponseEntity<CondicionesLogisticasResponse> registrar(
            @PathVariable Long idOrden,
            @Valid @RequestBody CondicionesLogisticasRequest request) {

        return ResponseEntity.ok(
                condicionesService.registrar(idOrden, request)
        );
    }

    @GetMapping
    public ResponseEntity<CondicionesLogisticasResponse> consultar(
            @PathVariable Long idOrden) {

        return ResponseEntity.ok(
                condicionesService.consultar(idOrden)
        );
    }
}