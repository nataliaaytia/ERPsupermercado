
package com.sonic.erp.cotizaciones.controller;

import com.sonic.erp.cotizaciones.dto.request.RegistrarOfertaRequest;
import com.sonic.erp.cotizaciones.dto.request.ActualizarOfertaRequest;
import com.sonic.erp.cotizaciones.service.OfertaProveedorService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ofertas")
@CrossOrigin(origins = "*")
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

    @PutMapping("/{idOferta}")
    public ResponseEntity<Map<String, Object>> actualizar(
            @PathVariable Long idOferta,
            @Valid @RequestBody ActualizarOfertaRequest datos) {

        Long idActualizado = ofertaProveedorService.actualizar(
                idOferta, datos
        );

        return ResponseEntity.ok(Map.of(
                "mensaje", "Oferta actualizada correctamente",
                "idOferta", idActualizado
        ));
    }

    @PutMapping("/{idOferta}/adjudicar")
    public ResponseEntity<com.sonic.erp.cotizaciones.dto.response.AdjudicarOfertaResponse> adjudicar(
            @PathVariable Long idOferta) {
        com.sonic.erp.cotizaciones.dto.response.AdjudicarOfertaResponse response =
                ofertaProveedorService.adjudicarOferta(idOferta);
        return ResponseEntity.ok(response);
    }
}
