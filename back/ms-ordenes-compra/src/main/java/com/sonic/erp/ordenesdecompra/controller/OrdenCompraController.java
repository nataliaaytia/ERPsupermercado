
package com.sonic.erp.ordenesdecompra.controller;

import com.sonic.erp.ordenesdecompra.entity.OrdenCompra;
import com.sonic.erp.ordenesdecompra.service.OrdenCompraService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ordenes-compra")
@CrossOrigin(origins = "*")
public class OrdenCompraController {

    private final OrdenCompraService ordenCompraService;

    public OrdenCompraController(
            OrdenCompraService ordenCompraService) {
        this.ordenCompraService = ordenCompraService;
    }

    @PostMapping("/desde-oferta/{idSolicitud}/{idOferta}")
    public ResponseEntity<Map<String, Object>> generarDesdeOferta(
            @PathVariable Long idSolicitud,
            @PathVariable Long idOferta) {

        OrdenCompra orden = ordenCompraService
                .generarDesdeOferta(idSolicitud, idOferta);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(Map.of(
                        "mensaje", "Orden de compra generada correctamente",
                        "idOrden", orden.getIdOrden(),
                        "numero", orden.getNumero(),
                        "idOferta", orden.getIdOferta(),
                        "proveedorId", orden.getProveedorId(),
                        "estado", orden.getEstado(),
                        "total", orden.getTotal()
                ));
    }
}
