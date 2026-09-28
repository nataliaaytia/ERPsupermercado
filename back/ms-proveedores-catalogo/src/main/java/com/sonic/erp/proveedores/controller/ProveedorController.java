package com.sonic.erp.proveedores.controller;
import com.sonic.erp.proveedores.dto.request.ProveedorCreateRequest;
import com.sonic.erp.proveedores.entity.Proveedor;
import com.sonic.erp.proveedores.service.ProveedorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
