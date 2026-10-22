package com.sonic.erp.cotizaciones.controller;

import com.sonic.erp.cotizaciones.dto.request.AlertaInventario;
import com.sonic.erp.cotizaciones.entity.Requisicion;
import com.sonic.erp.cotizaciones.service.PubSubService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pubsub")
@CrossOrigin(origins = "*")
public class PubSubController {

    private final PubSubService pubSubService;

    public PubSubController(PubSubService pubSubService) {
        this.pubSubService = pubSubService;
    }

    @PostMapping("/procesar-alerta")
    public ResponseEntity<Requisicion> procesarAlerta(@RequestBody AlertaInventario alerta) {
        try {
            String jsonPayload = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(alerta);
            Requisicion requisicion = pubSubService.consumirAlertaJson(jsonPayload);
            return ResponseEntity.ok(requisicion);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Publica la alerta directamente en Google Pub/Sub
    @PostMapping("/publicar-alerta")
    public ResponseEntity<String> publicarAlerta(@RequestBody AlertaInventario alerta) {
        try {
            String messageId = pubSubService.publicarAlertaInventario(alerta);
            return ResponseEntity.ok("Alerta publicada en PubSub con ID: " + messageId);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al publicar: " + e.getMessage());
        }
    }
}