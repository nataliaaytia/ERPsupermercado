package com.sonic.erp.proveedores.controller;

import com.sonic.erp.proveedores.dto.response.CumplimientoPlazosResponse;
import com.sonic.erp.proveedores.dto.response.CumplimientoEntregasResponse;
import com.sonic.erp.proveedores.service.CumplimientoProveedorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/cumplimiento-proveedores")
@RequiredArgsConstructor
public class CumplimientoProveedorController {

    private final CumplimientoProveedorService cumplimientoService;

    @GetMapping("/{idProveedor}/entregas-a-tiempo")
    public ResponseEntity<CumplimientoPlazosResponse> obtenerCumplimientoPlazos(
            @PathVariable Long idProveedor) {
        CumplimientoPlazosResponse respuesta = cumplimientoService.consultarCumplimientoPlazos(idProveedor);
        return ResponseEntity.ok(respuesta);
    }

}