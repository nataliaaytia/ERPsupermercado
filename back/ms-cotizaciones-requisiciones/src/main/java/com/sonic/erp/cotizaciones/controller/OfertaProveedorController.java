
package com.sonic.erp.cotizaciones.controller;

import com.sonic.erp.cotizaciones.dto.request.RegistrarOfertaRequest;
import com.sonic.erp.cotizaciones.service.OfertaProveedorService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ofertas")
public class OfertaProveedorController {

    private final OfertaProveedorService ofertaProveedorService;

    public OfertaProveedorController(
            OfertaProveedorService ofertaProveedorService) {

        this.ofertaProveedorService = ofertaProveedorService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> registrar(
            @Valid @RequestBody RegistrarOfertaRequest datos) {

        Long idOferta = ofertaProveedorService.registrar(datos);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(Map.of(
                        "mensaje", "Oferta registrada correctamente",
                        "idOferta", idOferta
                ));
    }
}
