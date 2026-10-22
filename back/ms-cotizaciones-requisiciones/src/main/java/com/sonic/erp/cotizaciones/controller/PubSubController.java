package com.sonic.erp.cotizaciones.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sonic.erp.cotizaciones.dto.request.AlertaInventario;
import com.sonic.erp.cotizaciones.entity.Requisicion;
import com.sonic.erp.cotizaciones.exception.AlertaDuplicadaException;
import com.sonic.erp.cotizaciones.service.AlertaInventarioConsumer;
import com.sonic.erp.cotizaciones.service.PubSubService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/pubsub")
@CrossOrigin(origins = "*")
public class PubSubController {

    private final PubSubService pubSubService;
    private final AlertaInventarioConsumer alertaInventarioConsumer;
    private final ObjectMapper objectMapper;

    public PubSubController(PubSubService pubSubService,
                            AlertaInventarioConsumer alertaInventarioConsumer,
                            ObjectMapper objectMapper) {
        this.pubSubService = pubSubService;
        this.alertaInventarioConsumer = alertaInventarioConsumer;
        this.objectMapper = objectMapper;
    }
    @PostMapping("/consumir-alerta-async")
    public ResponseEntity<String> recibirAlertaAsync(@RequestBody AlertaInventario alerta) {
        try {
            alertaInventarioConsumer.consumirAlertaAsincrona(alerta);
            return ResponseEntity.accepted().body("Alerta " + alerta.getIdAlerta() + " recibida asíncronamente y en proceso de registro.");
        } catch (AlertaDuplicadaException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al recibir alerta asíncrona: " + e.getMessage());
        }
    }
    @PostMapping("/procesar-alerta")
    public ResponseEntity<?> procesarAlerta(@RequestBody AlertaInventario alerta) {
        try {
            String jsonPayload = objectMapper.writeValueAsString(alerta);
            Requisicion requisicion = pubSubService.consumirAlertaJson(jsonPayload);
            return ResponseEntity.ok(requisicion);
        } catch (AlertaDuplicadaException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    Map.of(
                            "error", "ALERTA_DUPLICADA",
                            "mensaje", e.getMessage(),
                            "alertaId", e.getAlertaId(),
                            "idRequisicionExistente", e.getRequisicionIdExistente()
                    )
            );
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno: " + e.getMessage());
        }
    }
    @PostMapping("/publicar-alerta")
    public ResponseEntity<String> publicarAlerta(@RequestBody AlertaInventario alerta) {
        try {
            String messageId = pubSubService.publicarAlertaInventario(alerta);
            return ResponseEntity.ok("Alerta publicada en PubSub con ID: " + messageId);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al publicar: " + e.getMessage());
        }
    }

    @GetMapping("/enviar")
    public ResponseEntity<String> enviarPrueba() {
        try {
            String resultado = pubSubService.enviarMensaje();
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al enviar mensaje: " + e.getMessage());
        }
    }
}