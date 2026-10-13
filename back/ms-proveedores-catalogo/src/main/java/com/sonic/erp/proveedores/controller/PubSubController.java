package com.sonic.erp.proveedores.controller;
import com.sonic.erp.proveedores.service.PubSubService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pubsub")
public class PubSubController {

    private final PubSubService pubSubService;

    public PubSubController(PubSubService pubSubService) {
        this.pubSubService = pubSubService;
    }

    @GetMapping("/enviar")
    public ResponseEntity<String> enviar() {
        try {
            String respuesta = pubSubService.enviarMensaje();
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al publicar: " + e.getMessage());
        }
    }
}
