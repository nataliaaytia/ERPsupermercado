
package com.sonic.erp.ordenesdecompra.controller;

import com.sonic.erp.ordenesdecompra.dto.request.RegistrarRespuestaProveedorRequest;
import com.sonic.erp.ordenesdecompra.service.RespuestaProveedorOrdenCompraService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ordenes-compra")
@CrossOrigin(origins = "*")
public class RespuestaProveedorOrdenCompraController {

    private final RespuestaProveedorOrdenCompraService service;

    public RespuestaProveedorOrdenCompraController(
            RespuestaProveedorOrdenCompraService service) {
        this.service = service;
    }

    @PostMapping("/{idOrden}/respuesta-proveedor")
    public ResponseEntity<RespuestaProveedorOrdenCompraService.ResultadoRespuesta>
    registrarRespuesta(
            @PathVariable Long idOrden,
            @Valid @RequestBody RegistrarRespuestaProveedorRequest request) {

        var resultado = service.registrarRespuesta(idOrden, request);

        if (resultado.yaRegistrada()) {
            return ResponseEntity.ok(resultado);
        }

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(resultado);
    }
}
