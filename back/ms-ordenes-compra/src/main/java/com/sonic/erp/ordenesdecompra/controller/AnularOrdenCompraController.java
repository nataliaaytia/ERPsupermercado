
package com.sonic.erp.ordenesdecompra.controller;

import com.sonic.erp.ordenesdecompra.dto.request.AnularOrdenCompraRequest;
import com.sonic.erp.ordenesdecompra.service.AnularOrdenCompraService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ordenes-compra")
@CrossOrigin(origins = "*")
public class AnularOrdenCompraController {

    private final AnularOrdenCompraService service;

    public AnularOrdenCompraController(
            AnularOrdenCompraService service) {
        this.service = service;
    }

    @PostMapping("/{idOrden}/anular")
    public ResponseEntity<AnularOrdenCompraService.ResultadoAnulacion>
    anularOrden(
            @PathVariable Long idOrden,
            @Valid @RequestBody AnularOrdenCompraRequest request) {

        var resultado = service.anularOrden(idOrden, request);

        return ResponseEntity.ok(resultado);
    }
}
