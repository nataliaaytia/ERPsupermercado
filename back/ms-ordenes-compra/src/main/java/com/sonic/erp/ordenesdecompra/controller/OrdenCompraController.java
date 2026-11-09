
package com.sonic.erp.ordenesdecompra.controller;

import com.sonic.erp.ordenesdecompra.entity.OrdenCompra;
import com.sonic.erp.ordenesdecompra.service.OrdenCompraService;
import com.sonic.erp.ordenesdecompra.dto.request.EditarOrdenCompraRequest;
import com.sonic.erp.ordenesdecompra.dto.response.OrdenCompraDetalleResponse;
import com.sonic.erp.ordenesdecompra.dto.response.OrdenCompraResumenResponse;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;

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

    @PutMapping("/{idOrden}")
    public ResponseEntity<Map<String, Object>> editarOrden(
            @PathVariable Long idOrden,
            @Valid @RequestBody EditarOrdenCompraRequest request) {

        OrdenCompra orden = ordenCompraService.editarBorrador(
                idOrden, request);

        return ResponseEntity.ok(Map.of(
                "mensaje", "Orden de compra actualizada correctamente",
                "idOrden", orden.getIdOrden(),
                "numero", orden.getNumero(),
                "idOferta", orden.getIdOferta(),
                "proveedorId", orden.getProveedorId(),
                "estado", orden.getEstado(),
                "total", orden.getTotal(),
                "detalles", orden.getDetalles().stream()
                        .map(detalle -> Map.of(
                                "productoId", detalle.getProductoId(),
                                "cantidad", detalle.getCantidad(),
                                "precio", detalle.getPrecio(),
                                "subtotal", detalle.getSubtotal()
                        ))
                        .toList()
        ));
    }

    @GetMapping("/{idOrden}")
    public ResponseEntity<OrdenCompraDetalleResponse> consultarDetalle(
            @PathVariable Long idOrden) {

        OrdenCompraDetalleResponse respuesta =
                ordenCompraService.consultarDetalle(idOrden);

        return ResponseEntity.ok(respuesta);
    }

    @GetMapping("/buscar")
    public ResponseEntity<Page<OrdenCompraResumenResponse>> buscarOrdenes(
            @RequestParam(required = false) String numero,
            @RequestParam(required = false) Long proveedorId,
            @RequestParam(required = false) String estado,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<OrdenCompraResumenResponse> resultados =
                ordenCompraService.buscarOrdenes(
                        numero,
                        proveedorId,
                        estado,
                        page,
                        size
                );

        return ResponseEntity.ok(resultados);
    }

    @PostMapping("/{idOrden}/solicitar-aprobacion")
    public ResponseEntity<Map<String, Object>> solicitarAprobacion(
            @PathVariable Long idOrden) {

        OrdenCompra orden =
                ordenCompraService.solicitarAprobacion(idOrden);

        return ResponseEntity.ok(Map.of(
                "mensaje", "Orden enviada a aprobacion correctamente",
                "idOrden", orden.getIdOrden(),
                "numero", orden.getNumero(),
                "estado", orden.getEstado()
        ));
    }

}
