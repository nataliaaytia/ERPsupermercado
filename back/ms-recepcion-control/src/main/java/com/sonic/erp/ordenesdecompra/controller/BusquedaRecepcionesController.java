package com.sonic.erp.ordenesdecompra.controller;

import com.sonic.erp.ordenesdecompra.dto.response.RecepcionDetalleResponse;
import com.sonic.erp.ordenesdecompra.dto.response.RecepcionResumenResponse;
import com.sonic.erp.ordenesdecompra.service.BusquedaRecepcionesService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/recepciones")
@CrossOrigin(origins = "*")
public class BusquedaRecepcionesController {

    private final BusquedaRecepcionesService busquedaService;

    public BusquedaRecepcionesController(
            BusquedaRecepcionesService busquedaService) {
        this.busquedaService = busquedaService;
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<RecepcionResumenResponse>> buscar(
            @RequestParam(required = false) Long idOrden,
            @RequestParam(required = false) Long proveedorId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate desde,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate hasta) {

        return ResponseEntity.ok(
                busquedaService.buscar(idOrden, proveedorId, desde, hasta)
        );
    }

    @GetMapping("/{idRecepcion}/detalle")
    public ResponseEntity<RecepcionDetalleResponse> consultarDetalle(
            @PathVariable Long idRecepcion) {

        return ResponseEntity.ok(
                busquedaService.consultarDetalle(idRecepcion)
        );
    }
}