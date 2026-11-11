package com.sonic.erp.ordenesdecompra.controller;

import com.sonic.erp.ordenesdecompra.dto.request.CerrarOrdenCompraRequest;
import com.sonic.erp.ordenesdecompra.dto.response.CierreOrdenCompraResponse;
import com.sonic.erp.ordenesdecompra.service.CierreOrdenCompraService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ordenes-compra")
@CrossOrigin(origins = "*")
public class CierreOrdenCompraController {

    private final CierreOrdenCompraService cierreOrdenCompraService;

    public CierreOrdenCompraController(
            CierreOrdenCompraService cierreOrdenCompraService) {
        this.cierreOrdenCompraService = cierreOrdenCompraService;
    }

    @PostMapping("/{idOrden}/cerrar")
    public ResponseEntity<CierreOrdenCompraResponse> cerrar(
            @PathVariable Long idOrden,
            @Valid @RequestBody CerrarOrdenCompraRequest request) {

        return ResponseEntity.ok(
                cierreOrdenCompraService.cerrar(
                        idOrden,
                        request.responsable()
                )
        );
    }
}