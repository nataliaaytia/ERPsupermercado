package com.sonic.erp.proveedores.controller;

import com.sonic.erp.proveedores.dto.request.IncidenciaCreateRequest;
import com.sonic.erp.proveedores.entity.IncidenciaProveedor;
import com.sonic.erp.proveedores.service.IncidenciaProveedorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/incidencias")
@RequiredArgsConstructor
public class IncidenciaProveedorController {

    private final IncidenciaProveedorService incidenciaService;
    @PostMapping
    public ResponseEntity<IncidenciaProveedor> registrar(@Valid @RequestBody IncidenciaCreateRequest request) {
        IncidenciaProveedor nuevaIncidencia = incidenciaService.registrarIncidencia(request);
        return new ResponseEntity<>(nuevaIncidencia, HttpStatus.CREATED);
    }
    @GetMapping("/proveedor/{idProveedor}")
    public ResponseEntity<List<IncidenciaProveedor>> listarPorProveedor(@PathVariable Long idProveedor) {
        List<IncidenciaProveedor> lista = incidenciaService.listarPorProveedor(idProveedor);
        return ResponseEntity.ok(lista);
    }
}