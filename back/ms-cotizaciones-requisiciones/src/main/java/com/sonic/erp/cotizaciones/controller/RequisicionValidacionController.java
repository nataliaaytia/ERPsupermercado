
package com.sonic.erp.cotizaciones.controller;

import com.sonic.erp.cotizaciones.service.RequisicionValidacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requisiciones")
public class RequisicionValidacionController {

    private final RequisicionValidacionService validacionService;

    public RequisicionValidacionController(
            RequisicionValidacionService validacionService) {
        this.validacionService = validacionService;
    }

    @GetMapping("/{id}/validar")
    public ResponseEntity<Map<String, Object>> validar(
            @PathVariable Long id) {

        List<String> errores = validacionService.validarPorId(id);

        Map<String, Object> respuesta = new LinkedHashMap<>();
        respuesta.put("idRequisicion", id);
        respuesta.put("valida", errores.isEmpty());
        respuesta.put("errores", errores);

        return ResponseEntity.ok(respuesta);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> consultar(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                validacionService.consultarPorId(id)
        );
    }

    @GetMapping("/{id}/historial")
    public ResponseEntity<?> consultarHistorial(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                validacionService.consultarHistorial(id)
        );
    }

    @PutMapping("/{id}/prioridad")
    public ResponseEntity<Map<String, Object>> actualizarPrioridad(
            @PathVariable Long id,
            @RequestBody Map<String, String> solicitud) {

        String prioridad = solicitud.get("prioridad");

        return ResponseEntity.ok(
                validacionService.actualizarPrioridad(id, prioridad)
        );
    }

    @PutMapping("/{id}/aprobar")
    public ResponseEntity<Map<String, Object>> aprobar(
            @PathVariable Long id) {

        return ResponseEntity.ok(validacionService.aprobar(id));
    }

    @PutMapping("/{id}/rechazar")
    public ResponseEntity<Map<String, Object>> rechazar(
            @PathVariable Long id) {

        return ResponseEntity.ok(validacionService.rechazar(id));
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<Map<String, Object>> cancelar(
            @PathVariable Long id) {

        return ResponseEntity.ok(validacionService.cancelar(id));
    }
}
