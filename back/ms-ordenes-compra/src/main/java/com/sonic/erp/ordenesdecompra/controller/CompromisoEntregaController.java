package com.sonic.erp.ordenesdecompra.controller;

import com.sonic.erp.ordenesdecompra.dto.request.RegistrarCompromisoEntregaRequest;
import com.sonic.erp.ordenesdecompra.dto.response.CompromisoEntregaResponse;
import com.sonic.erp.ordenesdecompra.service.CompromisoEntregaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ordenes-compra")
@CrossOrigin(origins = "*")
public class CompromisoEntregaController {

    private final CompromisoEntregaService compromisoEntregaService;

    public CompromisoEntregaController(
            CompromisoEntregaService compromisoEntregaService) {
        this.compromisoEntregaService = compromisoEntregaService;
    }

    @PostMapping("/{idOrden}/detalles/{idDetalle}/compromisos")
    public ResponseEntity<CompromisoEntregaResponse> registrar(
            @PathVariable Long idOrden,
            @PathVariable Long idDetalle,
            @Valid @RequestBody RegistrarCompromisoEntregaRequest request) {

        CompromisoEntregaResponse respuesta =
                compromisoEntregaService.registrar(
                        idOrden,
                        idDetalle,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(respuesta);
    }
}