package com.sonic.erp.proveedores.controller;

import com.sonic.erp.proveedores.dto.response.CalidadProveedorResponse;
import com.sonic.erp.proveedores.service.CalidadProveedorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/proveedores")
@RequiredArgsConstructor
public class CalidadProveedorController {

    private final CalidadProveedorService calidadProveedorService;

    @GetMapping("/{idProveedor}/calidad")
    public ResponseEntity<CalidadProveedorResponse> obtenerCalidadProveedor(
            @PathVariable Long idProveedor) {

        CalidadProveedorResponse respuesta =
                calidadProveedorService.obtenerCalidadProveedor(idProveedor);

        return ResponseEntity.ok(respuesta);
    }
}