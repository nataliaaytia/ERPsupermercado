package com.sonic.erp.ordenesdecompra.controller;

import com.sonic.erp.ordenesdecompra.dto.response.ConciliacionResponse;
import com.sonic.erp.ordenesdecompra.service.ConciliacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/conciliaciones")
@CrossOrigin(origins = "*")
public class ConciliacionController {

    private final ConciliacionService conciliacionService;

    public ConciliacionController(ConciliacionService conciliacionService) {
        this.conciliacionService = conciliacionService;
    }

    @GetMapping("/recepcion/{idRecepcion}/orden/{idOrden}")
    public ResponseEntity<?> conciliar(@PathVariable Long idRecepcion, @PathVariable Long idOrden) {
        try {
            ConciliacionResponse response = conciliacionService.conciliarRecepcionConOrden(idRecepcion, idOrden);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}