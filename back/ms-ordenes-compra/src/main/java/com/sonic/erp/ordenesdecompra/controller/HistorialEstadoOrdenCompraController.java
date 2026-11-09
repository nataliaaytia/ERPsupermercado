
package com.sonic.erp.ordenesdecompra.controller;

import com.sonic.erp.ordenesdecompra.service.HistorialEstadoOrdenCompraService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ordenes-compra")
@CrossOrigin(origins = "*")
public class HistorialEstadoOrdenCompraController {

    private final HistorialEstadoOrdenCompraService service;

    public HistorialEstadoOrdenCompraController(
            HistorialEstadoOrdenCompraService service) {
        this.service = service;
    }

    @GetMapping("/{idOrden}/historial-estados")
    public ResponseEntity<HistorialEstadoOrdenCompraService.ResultadoHistorial>
    consultarHistorial(@PathVariable Long idOrden) {

        var resultado = service.consultarHistorial(idOrden);

        return ResponseEntity.ok(resultado);
    }
}
