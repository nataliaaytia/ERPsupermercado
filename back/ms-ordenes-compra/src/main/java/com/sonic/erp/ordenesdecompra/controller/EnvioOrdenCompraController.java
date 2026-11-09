
package com.sonic.erp.ordenesdecompra.controller;

import com.sonic.erp.ordenesdecompra.service.EnvioOrdenCompraService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ordenes-compra")
@CrossOrigin(origins = "*")
public class EnvioOrdenCompraController {

    private final EnvioOrdenCompraService envioService;

    public EnvioOrdenCompraController(
            EnvioOrdenCompraService envioService) {
        this.envioService = envioService;
    }

    @PostMapping("/{idOrden}/enviar")
    public ResponseEntity<EnvioOrdenCompraService.ResultadoEnvio>
    enviarOrden(@PathVariable Long idOrden) {

        var resultado = envioService.enviarOrden(idOrden);

        if ("FALLIDO".equals(resultado.resultado())) {
            return ResponseEntity
                    .status(HttpStatus.BAD_GATEWAY)
                    .body(resultado);
        }

        return ResponseEntity.ok(resultado);
    }
}
