package com.sonic.erp.ordenesdecompra.controller;

import com.sonic.erp.ordenesdecompra.dto.request.RespuestaContabilidadRequest;
import com.sonic.erp.ordenesdecompra.dto.response.SeguimientoRespuestaContableResponse;
import com.sonic.erp.ordenesdecompra.service.ProcesadorRespuestaContableService;
import com.sonic.erp.ordenesdecompra.service.PubSubSuscripcionContableService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/respuestas-contabilidad")
@CrossOrigin(origins = "*")
public class RespuestaContabilidadPubSubController {

    private final ProcesadorRespuestaContableService procesadorService;
    private final PubSubSuscripcionContableService suscripcionService;

    public RespuestaContabilidadPubSubController(ProcesadorRespuestaContableService procesadorService,
                                                 PubSubSuscripcionContableService suscripcionService) {
        this.procesadorService = procesadorService;
        this.suscripcionService = suscripcionService;
    }

    @PostMapping("/procesar")
    public ResponseEntity<?> procesarRespuesta(@Valid @RequestBody RespuestaContabilidadRequest request) {
        try {
            SeguimientoRespuestaContableResponse response = procesadorService.procesarRespuestaContabilidad(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/consumir-payload")
    public ResponseEntity<?> consumirPayloadRaw(@RequestBody String payloadJson) {
        try {
            SeguimientoRespuestaContableResponse response = suscripcionService.consumirRespuestaContableJson(payloadJson);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al procesar mensaje contable: " + e.getMessage());
        }
    }
}