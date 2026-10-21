package com.sonic.erp.cotizaciones.controller;

import com.sonic.erp.cotizaciones.dto.response.ComparativaOfertasResponse;
import com.sonic.erp.cotizaciones.service.EvaluacionOfertasService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/evaluacion-ofertas")
@CrossOrigin(origins = "*")
public class EvaluacionOfertasController {

    private final EvaluacionOfertasService evaluacionOfertasService;

    public EvaluacionOfertasController(EvaluacionOfertasService evaluacionOfertasService) {
        this.evaluacionOfertasService = evaluacionOfertasService;
    }

    @GetMapping("/solicitud/{idSolicitud}")
    public ResponseEntity<ComparativaOfertasResponse> obtenerPorSolicitud(@PathVariable Long idSolicitud) {
        return ResponseEntity.ok(evaluacionOfertasService.compararOfertasPorSolicitud(idSolicitud));
    }

    @GetMapping("/requisicion/{idRequisicion}")
    public ResponseEntity<ComparativaOfertasResponse> obtenerPorRequisicion(@PathVariable Long idRequisicion) {
        return ResponseEntity.ok(evaluacionOfertasService.compararOfertasPorRequisicion(idRequisicion));
    }
}