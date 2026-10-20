package com.sonic.erp.cotizaciones.controller;

import com.sonic.erp.cotizaciones.dto.request.ConsolidarRequisicionesRequest;
import com.sonic.erp.cotizaciones.service.ConsolidacionRequisicionesService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/consolidaciones")
public class ConsolidacionRequisicionesController {

    private final ConsolidacionRequisicionesService consolidacionService;

    public ConsolidacionRequisicionesController(
            ConsolidacionRequisicionesService consolidacionService) {
        this.consolidacionService = consolidacionService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> consolidar(
            @RequestBody ConsolidarRequisicionesRequest datos) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(consolidacionService.consolidar(datos));
    }
}