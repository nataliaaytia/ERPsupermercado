package com.sonic.erp.ordenesdecompra.controller;

import com.sonic.erp.ordenesdecompra.dto.request.RespuestaDisponibilidadRequest;
import com.sonic.erp.ordenesdecompra.dto.response.SeguimientoRespuestaDespachoResponse;
import com.sonic.erp.ordenesdecompra.service.ProcesadorRespuestaDespachoService;
import com.sonic.erp.ordenesdecompra.service.PubSubSuscripcionDespachoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/respuestas-despacho")
@CrossOrigin(origins = "*")
public class RespuestaDespachoPubSubController {

    private final ProcesadorRespuestaDespachoService procesadorService;
    private final PubSubSuscripcionDespachoService suscripcionService;

    public RespuestaDespachoPubSubController(ProcesadorRespuestaDespachoService procesadorService,
                                             PubSubSuscripcionDespachoService suscripcionService) {
        this.procesadorService = procesadorService;
        this.suscripcionService = suscripcionService;
    }

    @PostMapping("/procesar")
    public ResponseEntity<?> procesarRespuesta(@Valid @RequestBody RespuestaDisponibilidadRequest request) {
        try {
            SeguimientoRespuestaDespachoResponse response = procesadorService.procesarRespuesta(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/consumir-payload")
    public ResponseEntity<?> consumirPayloadRaw(@RequestBody String payloadJson) {
        try {
            SeguimientoRespuestaDespachoResponse response = suscripcionService.consumirMensajeRespuestaJson(payloadJson);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al procesar mensaje Pub/Sub: " + e.getMessage());
        }
    }
}