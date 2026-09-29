package com.sonic.erp.proveedores.controller;
import com.sonic.erp.proveedores.dto.request.ProveedorCreateRequest;
import com.sonic.erp.proveedores.dto.request.ProveedorUpdateRequest;
import com.sonic.erp.proveedores.entity.Proveedor;
import com.sonic.erp.proveedores.service.ProveedorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.sonic.erp.proveedores.dto.response.ProveedorValidacionResponse;

import java.util.List;

@RestController
@RequestMapping("/proveedores")
@RequiredArgsConstructor
public class ProveedorController {
    private final ProveedorService proveedorService;

    @PostMapping
    public ResponseEntity<Proveedor> registrar(@Valid @RequestBody ProveedorCreateRequest request){
        Proveedor nuevoProveedor = proveedorService.registrarProveedor(request);

        return new ResponseEntity<>(nuevoProveedor, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Proveedor> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ProveedorUpdateRequest request){
        Proveedor proveedorActualizado = proveedorService.actualizarProveedor(id, request);
        return ResponseEntity.ok(proveedorActualizado);
    }

    @PostMapping("/{id}/validar")
    public ResponseEntity<ProveedorValidacionResponse> validar(@PathVariable Long id) {
        ProveedorValidacionResponse resultado = proveedorService.validarProveedor(id);
        return ResponseEntity.ok(resultado);
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Proveedor> actualizarEstado(
            @PathVariable Long id,
            @RequestParam String estado) {

        Proveedor proveedor = proveedorService.actualizarEstado(id, estado);
        return ResponseEntity.ok(proveedor);
    }

    @GetMapping
    public ResponseEntity<List<Proveedor>> listar() {
        List<Proveedor> proveedores = proveedorService.listarProveedores();
        return ResponseEntity.ok(proveedores);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Proveedor> obtenerPorId(@PathVariable Long id) {
        Proveedor proveedor = proveedorService.obtenerProveedorPorId(id);
        return ResponseEntity.ok(proveedor);
    }
}
