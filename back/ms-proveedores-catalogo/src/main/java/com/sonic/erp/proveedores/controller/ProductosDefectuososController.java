package com.sonic.erp.proveedores.controller;

import com.sonic.erp.proveedores.dto.response.ProductosDefectuososResponse;
import com.sonic.erp.proveedores.service.ProductosDefectuososService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/proveedores")
@RequiredArgsConstructor
public class ProductosDefectuososController {

    private final ProductosDefectuososService productosDefectuososService;

    @GetMapping("/{idProveedor}/productos-defectuosos")
    public ResponseEntity<ProductosDefectuososResponse> obtenerProductosDefectuosos(
            @PathVariable Long idProveedor) {
        ProductosDefectuososResponse respuesta = productosDefectuososService.obtenerProductosDefectuosos(idProveedor);
        return ResponseEntity.ok(respuesta);
    }
}