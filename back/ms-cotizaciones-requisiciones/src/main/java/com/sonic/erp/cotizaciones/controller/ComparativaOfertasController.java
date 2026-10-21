package com.sonic.erp.cotizaciones.controller;

import com.sonic.erp.cotizaciones.dto.response.ComparativaCondicionesEntregaResponse;
import com.sonic.erp.cotizaciones.dto.response.ComparativaCostosResponse;
import com.sonic.erp.cotizaciones.dto.response.ComparativaOfertasResponse;
import com.sonic.erp.cotizaciones.service.ComparativaCondicionesService;
import com.sonic.erp.cotizaciones.service.ComparativaCostosService;
import com.sonic.erp.cotizaciones.service.ComparativaOfertasService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comparativas")
public class ComparativaOfertasController {

    private final ComparativaOfertasService comparativaService;
    private final ComparativaCondicionesService condicionesService;
    private final ComparativaCostosService comparativaCostosService;

    public ComparativaOfertasController(
            ComparativaOfertasService comparativaService,
            ComparativaCondicionesService condicionesService,
            ComparativaCostosService comparativaCostosService) {
        this.comparativaService = comparativaService;
        this.condicionesService = condicionesService;
        this.comparativaCostosService = comparativaCostosService;
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

    @GetMapping("/costos/solicitud/{idSolicitud}")
    public ResponseEntity<ComparativaCostosResponse> compararCostosPorSolicitud(
            @PathVariable Long idSolicitud,
            @RequestParam(required = false, defaultValue = "asc") String orden) {
        return ResponseEntity.ok(comparativaCostosService.calcularCostosPorSolicitud(idSolicitud, orden));
    }
}