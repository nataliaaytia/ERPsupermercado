package com.sonic.erp.proveedores.controller;

import com.sonic.erp.proveedores.dto.response.DesempenoProveedorResponse;
import com.sonic.erp.proveedores.service.DesempenoProveedorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/proveedores")
@RequiredArgsConstructor
public class DesempenoProveedorController {

    private final DesempenoProveedorService desempenoProveedorService;

    @GetMapping("/{idProveedor}/desempeno")
    public ResponseEntity<DesempenoProveedorResponse> obtenerDesempeno(
            @PathVariable Long idProveedor) {

        DesempenoProveedorResponse respuesta =
                desempenoProveedorService.obtenerDesempeno(idProveedor);

        return ResponseEntity.ok(respuesta);
    }
}