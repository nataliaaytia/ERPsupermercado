package com.sonic.erp.proveedores.controller;

import com.sonic.erp.proveedores.dto.request.CondicionComercialCreateRequest;
import com.sonic.erp.proveedores.dto.response.CondicionComercialResponse;
import com.sonic.erp.proveedores.entity.CondicionComercial;
import com.sonic.erp.proveedores.service.CondicionComercialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/condicion-comercial")
@RequiredArgsConstructor
public class CondicionComercialController {

    private final CondicionComercialService condicionService;
    @PostMapping
    public ResponseEntity<CondicionComercial> registrar(@Valid @RequestBody CondicionComercialCreateRequest request) {
        CondicionComercial nuevaCondicion = condicionService.registrarCondicion(request);
        return new ResponseEntity<>(nuevaCondicion, HttpStatus.CREATED);
    }
    @GetMapping("/proveedor/{idProveedor}")
    public ResponseEntity<List<CondicionComercialResponse>> consultarPorProveedor(@PathVariable Long idProveedor) {
        List<CondicionComercialResponse> condiciones = condicionService.listarPorProveedor(idProveedor);
        return ResponseEntity.ok(condiciones);
    }
}