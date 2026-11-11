package com.sonic.erp.ordenesdecompra.controller;

import com.sonic.erp.ordenesdecompra.dto.request.RegistrarEntregaParcialRequest;
import com.sonic.erp.ordenesdecompra.dto.response.EntregaParcialResponse;
import com.sonic.erp.ordenesdecompra.service.RegistrarEntregaParcialService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recepciones/orden")
@CrossOrigin(origins = "*")
public class RegistrarEntregaParcialController {

    private final RegistrarEntregaParcialService registrarService;

    public RegistrarEntregaParcialController(
            RegistrarEntregaParcialService registrarService) {
        this.registrarService = registrarService;
    }

    @PostMapping("/{idOrden}/entregas")
    public ResponseEntity<EntregaParcialResponse> registrar(
            @PathVariable Long idOrden,
            @Valid @RequestBody RegistrarEntregaParcialRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(registrarService.registrar(idOrden, request));
    }
}