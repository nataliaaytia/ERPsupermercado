
package com.sonic.erp.cotizaciones.controller;

import com.sonic.erp.cotizaciones.dto.request.AsociarProveedoresRequest;
import com.sonic.erp.cotizaciones.service.SolicitudProveedorService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/solicitudes-cotizacion")
public class SolicitudProveedorController {

    private final SolicitudProveedorService solicitudProveedorService;

    public SolicitudProveedorController(
            SolicitudProveedorService solicitudProveedorService) {

        this.solicitudProveedorService = solicitudProveedorService;
    }

    @PostMapping("/{idSolicitud}/proveedores")
    public ResponseEntity<Map<String, Object>> asociarProveedores(
            @PathVariable Long idSolicitud,
            @Valid @RequestBody AsociarProveedoresRequest datos) {

        List<Long> proveedoresIds =
                solicitudProveedorService.asociar(idSolicitud, datos);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(Map.of(
                        "mensaje", "Proveedores asociados correctamente",
                        "idSolicitud", idSolicitud,
                        "proveedoresIds", proveedoresIds,
                        "estado", "ENVIADA"
                ));
    }


    @GetMapping("/{idSolicitud}/proveedores")
    public ResponseEntity<List<Long>> listarProveedores(
            @PathVariable Long idSolicitud) {

        return ResponseEntity.ok(
                solicitudProveedorService.listarPorSolicitud(idSolicitud)
        );
    }

}
