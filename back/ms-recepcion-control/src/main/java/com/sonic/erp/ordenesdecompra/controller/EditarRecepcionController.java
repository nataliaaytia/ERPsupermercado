package com.sonic.erp.ordenesdecompra.controller;

import com.sonic.erp.ordenesdecompra.dto.request.EditarRecepcionRequest;
import com.sonic.erp.ordenesdecompra.dto.response.RecepcionActualizadaResponse;
import com.sonic.erp.ordenesdecompra.service.EditarRecepcionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recepciones")
@CrossOrigin(origins = "*")
public class EditarRecepcionController {

    private final EditarRecepcionService editarRecepcionService;

    public EditarRecepcionController(
            EditarRecepcionService editarRecepcionService) {
        this.editarRecepcionService = editarRecepcionService;
    }

    @PutMapping("/{idRecepcion}")
    public ResponseEntity<RecepcionActualizadaResponse> editar(
            @PathVariable Long idRecepcion,
            @Valid @RequestBody EditarRecepcionRequest request) {

        return ResponseEntity.ok(
                editarRecepcionService.editar(idRecepcion, request)
        );
    }
}