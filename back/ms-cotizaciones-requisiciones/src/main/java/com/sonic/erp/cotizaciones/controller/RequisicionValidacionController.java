
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

    @PutMapping("/{id}/prioridad")
    public ResponseEntity<Map<String, Object>> actualizarPrioridad(
            @PathVariable Long id,
            @RequestBody Map<String, String> solicitud) {

        String prioridad = solicitud.get("prioridad");

        Map<String, Object> respuesta =
                validacionService.actualizarPrioridad(id, prioridad);

        return ResponseEntity.ok(respuesta);
    }
}
