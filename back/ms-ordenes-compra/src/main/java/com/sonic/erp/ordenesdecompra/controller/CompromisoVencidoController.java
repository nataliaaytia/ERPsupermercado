package com.sonic.erp.ordenesdecompra.controller;

import com.sonic.erp.ordenesdecompra.dto.response.CompromisoVencidoResponse;
import com.sonic.erp.ordenesdecompra.service.ConsultaCompromisosVencidosService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/compromisos-entrega")
@CrossOrigin(origins = "*")
public class CompromisoVencidoController {

    private final ConsultaCompromisosVencidosService consultaService;

    public CompromisoVencidoController(
            ConsultaCompromisosVencidosService consultaService) {
        this.consultaService = consultaService;
    }

    @GetMapping("/vencidos")
    public ResponseEntity<List<CompromisoVencidoResponse>> consultarVencidos() {
        return ResponseEntity.ok(consultaService.consultarVencidos());
    }
}