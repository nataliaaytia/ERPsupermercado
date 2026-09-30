package com.sonic.erp.proveedores.controller;

import com.sonic.erp.proveedores.dto.response.HistorialPrecioResponse;
import com.sonic.erp.proveedores.service.HistorialPrecioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/historial-precios")
@RequiredArgsConstructor
public class HistorialPrecioController {

    private final HistorialPrecioService historialPrecioService;
    @GetMapping("/proveedor/{idProveedor}/producto/{idProducto}")
    public ResponseEntity<List<HistorialPrecioResponse>> obtenerHistorial(
            @PathVariable Long idProveedor,
            @PathVariable Long idProducto) {
        List<HistorialPrecioResponse> historial = historialPrecioService.consultarHistorial(idProveedor, idProducto);
        return ResponseEntity.ok(historial);
    }
}