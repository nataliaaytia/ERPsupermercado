package com.sonic.erp.ordenesdecompra.controller;

import com.sonic.erp.ordenesdecompra.dto.request.RegistrarDevolucionRequest;
import com.sonic.erp.ordenesdecompra.dto.request.ResolverDevolucionRequest;
import com.sonic.erp.ordenesdecompra.dto.response.DevolucionResponse;
import com.sonic.erp.ordenesdecompra.dto.response.ResolucionDevolucionResponse;
import com.sonic.erp.ordenesdecompra.service.DevolucionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/devoluciones")
@CrossOrigin(origins = "*")
public class DevolucionController {

    private final DevolucionService devolucionService;

    public DevolucionController(DevolucionService devolucionService) {
        this.devolucionService = devolucionService;
    }

    @PostMapping
    public ResponseEntity<?> registrarDevolucion(@Valid @RequestBody RegistrarDevolucionRequest request) {
        try {
            DevolucionResponse response = devolucionService.registrarDevolucion(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/detalle/{idDetalle}")
    public ResponseEntity<List<DevolucionResponse>> listarPorDetalle(@PathVariable Long idDetalle) {
        return ResponseEntity.ok(devolucionService.listarPorDetalle(idDetalle));
    }

    @PatchMapping("/resolver")
    public ResponseEntity<?> resolverDevolucion(@Valid @RequestBody ResolverDevolucionRequest request) {
        try {
            ResolucionDevolucionResponse response = devolucionService.resolverDevolucion(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}