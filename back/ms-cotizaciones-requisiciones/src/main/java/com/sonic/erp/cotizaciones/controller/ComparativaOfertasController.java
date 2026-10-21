package com.sonic.erp.cotizaciones.controller;

import com.sonic.erp.cotizaciones.dto.response.ComparativaCondicionesEntregaResponse;
import com.sonic.erp.cotizaciones.dto.response.ComparativaOfertasResponse;
import com.sonic.erp.cotizaciones.service.ComparativaCondicionesService;
import com.sonic.erp.cotizaciones.service.ComparativaOfertasService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comparativas")
public class ComparativaOfertasController {

    private final ComparativaOfertasService comparativaService;
    private final ComparativaCondicionesService condicionesService;

    public ComparativaOfertasController(
            ComparativaOfertasService comparativaService,
            ComparativaCondicionesService condicionesService) {
        this.comparativaService = comparativaService;
        this.condicionesService = condicionesService;
    }

    @GetMapping("/solicitud/{idSolicitud}")
    public ResponseEntity<ComparativaOfertasResponse> compararPorSolicitud(
            @PathVariable Long idSolicitud) {
        return ResponseEntity.ok(comparativaService.compararPorSolicitud(idSolicitud));
    }

    @GetMapping("/requisicion/{idRequisicion}")
    public ResponseEntity<ComparativaOfertasResponse> compararPorRequisicion(
            @PathVariable Long idRequisicion) {
        return ResponseEntity.ok(comparativaService.compararPorRequisicion(idRequisicion));
    }

    // Endpoint específico para SCRUM-491: Comparación de tiempos y condiciones
    @GetMapping("/condiciones/solicitud/{idSolicitud}")
    public ResponseEntity<ComparativaCondicionesEntregaResponse> compararCondicionesPorSolicitud(
            @PathVariable Long idSolicitud) {
        return ResponseEntity.ok(condicionesService.compararCondicionesPorSolicitud(idSolicitud));
    }

    @GetMapping("/condiciones/requisicion/{idRequisicion}")
    public ResponseEntity<ComparativaCondicionesEntregaResponse> compararCondicionesPorRequisicion(
            @PathVariable Long idRequisicion) {
        return ResponseEntity.ok(condicionesService.compararCondicionesPorRequisicion(idRequisicion));
    }
}