package com.sonic.erp.proveedores.controller;

import com.sonic.erp.proveedores.dto.response.CumplimientoEntregasResponse;
import com.sonic.erp.proveedores.service.CumplimientoEntregasService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/proveedores")
@RequiredArgsConstructor
public class CumplimientoEntregasController {

    private final CumplimientoEntregasService cumplimientoEntregasService;

    @GetMapping("/{idProveedor}/entregas-completas")
    public ResponseEntity<CumplimientoEntregasResponse>
    obtenerCumplimientoEntregas(@PathVariable Long idProveedor) {

        CumplimientoEntregasResponse respuesta =
                cumplimientoEntregasService
                        .obtenerCumplimientoEntregas(idProveedor);

        return ResponseEntity.ok(respuesta);
    }
}