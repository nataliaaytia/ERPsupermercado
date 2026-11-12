package com.sonic.erp.ordenesdecompra.controller;

import com.sonic.erp.ordenesdecompra.dto.request.SolicitarCierreOrdenRequest;
import com.sonic.erp.ordenesdecompra.service.CoordinacionCierreOrdenService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recepciones/orden")
@CrossOrigin(origins = "*")
public class CierreOrdenRecepcionController {

    private final CoordinacionCierreOrdenService coordinacionCierreService;

    public CierreOrdenRecepcionController(
            CoordinacionCierreOrdenService coordinacionCierreService) {
        this.coordinacionCierreService = coordinacionCierreService;
    }

    @PostMapping("/{idOrden}/cerrar")
    public ResponseEntity<CoordinacionCierreOrdenService.RespuestaCierreOrden>
    solicitarCierre(
            @PathVariable Long idOrden,
            @Valid @RequestBody SolicitarCierreOrdenRequest request) {

        return ResponseEntity.ok(
                coordinacionCierreService.coordinarCierre(
                        idOrden,
                        request.responsable()
                )
        );
    }
}