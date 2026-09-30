package com.sonic.erp.proveedores.controller;

import com.sonic.erp.proveedores.dto.request.DescuentoCantidadRequest;
import com.sonic.erp.proveedores.dto.response.DescuentoCantidadResponse;
import com.sonic.erp.proveedores.service.DescuentoCantidadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/descuentos-cantidad")
@RequiredArgsConstructor
public class DescuentoCantidadController {

    private final DescuentoCantidadService descuentoService;
    @PostMapping
    public ResponseEntity<DescuentoCantidadResponse> registrar(@Valid @RequestBody DescuentoCantidadRequest request) {
        DescuentoCantidadResponse respuesta = descuentoService.registrarDescuento(request);
        return new ResponseEntity<>(respuesta, HttpStatus.CREATED);
    }
    @GetMapping("/catalogo/{idCatalogo}")
    public ResponseEntity<List<DescuentoCantidadResponse>> listarPorCatalogo(@PathVariable Long idCatalogo) {
        List<DescuentoCantidadResponse> lista = descuentoService.listarPorCatalogo(idCatalogo);
        return ResponseEntity.ok(lista);
    }
}