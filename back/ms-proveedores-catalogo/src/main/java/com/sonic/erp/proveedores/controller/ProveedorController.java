package com.sonic.erp.proveedores.controller;
import com.sonic.erp.proveedores.dto.request.ProveedorCreateRequest;
import com.sonic.erp.proveedores.dto.response.ComparacionPrecioResponse;
import com.sonic.erp.proveedores.dto.request.ProveedorUpdateRequest;
import com.sonic.erp.proveedores.dto.response.ProveedorDetalleResponse;
import com.sonic.erp.proveedores.dto.response.ComparacionTiempoEntregaResponse;
import com.sonic.erp.proveedores.dto.response.CatalogoCategoriaResponse;
import com.sonic.erp.proveedores.dto.response.RankingDescuentoResponse;
import com.sonic.erp.proveedores.dto.response.IndicadoresProveedorResponse;
import com.sonic.erp.proveedores.dto.response.ResumenComparativoProveedorResponse;
import com.sonic.erp.proveedores.entity.Proveedor;
import com.sonic.erp.proveedores.service.ProveedorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.sonic.erp.proveedores.dto.response.ProveedorValidacionResponse;
import com.sonic.erp.proveedores.dto.request.AsociarProductoRequest;
import com.sonic.erp.proveedores.entity.CatalogoComercial;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/proveedores")
@RequiredArgsConstructor
public class ProveedorController {
    private final ProveedorService proveedorService;

    @PostMapping
    public ResponseEntity<Proveedor> registrar(@Valid @RequestBody ProveedorCreateRequest request){
        Proveedor nuevoProveedor = proveedorService.registrarProveedor(request);

        return new ResponseEntity<>(nuevoProveedor, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Proveedor> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ProveedorUpdateRequest request){
        Proveedor proveedorActualizado = proveedorService.actualizarProveedor(id, request);
        return ResponseEntity.ok(proveedorActualizado);
    }

    @PostMapping("/{id}/validar")
    public ResponseEntity<ProveedorValidacionResponse> validar(@PathVariable Long id) {
        ProveedorValidacionResponse resultado = proveedorService.validarProveedor(id);
        return ResponseEntity.ok(resultado);
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Proveedor> actualizarEstado(
            @PathVariable Long id,
            @RequestParam String estado) {

        Proveedor proveedor = proveedorService.actualizarEstado(id, estado);
        return ResponseEntity.ok(proveedor);
    }

    @GetMapping
    public ResponseEntity<List<Proveedor>> listar() {
        List<Proveedor> proveedores = proveedorService.listarProveedores();
        return ResponseEntity.ok(proveedores);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Proveedor> obtenerPorId(@PathVariable Long id) {
        Proveedor proveedor = proveedorService.obtenerProveedorPorId(id);
        return ResponseEntity.ok(proveedor);
    }

    @GetMapping("/{id}/catalogo")
    public ResponseEntity<ProveedorDetalleResponse> consultarPorId(@PathVariable Long id) {
        ProveedorDetalleResponse detalle = proveedorService.consultarDetalleProveedor(id);
        return ResponseEntity.ok(detalle);
    }

    @GetMapping("/{idProveedor}/productos/{idProducto}/precio")
    public ResponseEntity<Map<String, Object>> consultarPrecioPactado(
            @PathVariable Long idProveedor,
            @PathVariable Long idProducto) {

        var precioPactado =
                proveedorService.consultarPrecioPactado(
                        idProveedor,
                        idProducto
                );

        Map<String, Object> respuesta = Map.of(
                "idProveedor", idProveedor,
                "idProducto", idProducto,
                "precioPactado", precioPactado
        );

        return ResponseEntity.ok(respuesta);
    }

    @GetMapping("/{idProveedor}/productos/{idProducto}/tiempo-entrega")
    public ResponseEntity<Map<String, Object>> consultarTiempoEntrega(
            @PathVariable Long idProveedor,
            @PathVariable Long idProducto) {

        Integer tiempoEntrega =
                proveedorService.consultarTiempoEntrega(
                        idProveedor,
                        idProducto
                );

        Map<String, Object> respuesta = Map.of(
                "idProveedor", idProveedor,
                "idProducto", idProducto,
                "tiempoEntregaDias", tiempoEntrega
        );

        return ResponseEntity.ok(respuesta);
    }

    @GetMapping("/ranking-retrasos")
    public ResponseEntity<List<Map<String, Object>>> obtenerRankingRetrasos() {

        List<Map<String, Object>> ranking =
                proveedorService.obtenerRankingRetrasos();

        return ResponseEntity.ok(ranking);
    }

    @GetMapping("/ranking-cumplimiento")
    public ResponseEntity<List<Map<String, Object>>> obtenerRankingCumplimiento() {

        List<Map<String, Object>> ranking =
                proveedorService.obtenerRankingCumplimiento();

        return ResponseEntity.ok(ranking);
    }

    @PostMapping("/{idProveedor}/productos/{idProducto}")
    public ResponseEntity<?> asociarProducto(
            @PathVariable Long idProveedor,
            @PathVariable Long idProducto,
            @Valid @RequestBody AsociarProductoRequest request) {

        try {
            CatalogoComercial catalogo = proveedorService.asociarProducto(
                    idProveedor,
                    idProducto,
                    request.getFechaInicio(),
                    request.getFechaFin(),
                    request.getCondiciones(),
                    request.getArchivo()
            );

            return ResponseEntity.ok(
                    Map.of(
                            "mensaje", "Producto asociado correctamente al proveedor",
                            "idCatalogo", catalogo.getIdCatalogo(),
                            "idProveedor", idProveedor,
                            "idProducto", idProducto
                    )
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", e.getMessage()));
        }
    }

    @GetMapping("/productos/{idProducto}/comparacion-precios")
    public ResponseEntity<ComparacionPrecioResponse> compararPrecios(
            @PathVariable Long idProducto) {

        ComparacionPrecioResponse comparacion =
                proveedorService.compararPrecios(idProducto);

        return ResponseEntity.ok(comparacion);
    }

    @GetMapping("/productos/{idProducto}/comparacion-tiempos-entrega")
    public ResponseEntity<ComparacionTiempoEntregaResponse> compararTiemposEntrega(
            @PathVariable Long idProducto) {

        ComparacionTiempoEntregaResponse comparacion =
                proveedorService.compararTiemposEntrega(idProducto);

        return ResponseEntity.ok(comparacion);
    }

    @GetMapping("/{idProveedor}/catalogo/categoria")
    public ResponseEntity<List<CatalogoCategoriaResponse>> filtrarCatalogoPorCategoria(
            @PathVariable Long idProveedor,
            @RequestParam String categoria) {

        return ResponseEntity.ok(
                proveedorService.filtrarCatalogoPorCategoria(idProveedor, categoria)
        );
    }

    @GetMapping("/{idProveedor}/catalogo/buscar")
    public ResponseEntity<List<CatalogoCategoriaResponse>> buscarProductosEnCatalogo(
            @PathVariable Long idProveedor,
            @RequestParam String termino) {

        return ResponseEntity.ok(
                proveedorService.buscarProductosEnCatalogo(idProveedor, termino)
        );
    }

    @GetMapping("/ranking-descuentos")
    public ResponseEntity<List<RankingDescuentoResponse>> obtenerRankingDescuentos() {

        return ResponseEntity.ok(
                proveedorService.obtenerRankingDescuentos()
        );
    }

    @GetMapping("/resumen-comparativo")
    public ResponseEntity<List<ResumenComparativoProveedorResponse>> obtenerResumenComparativo() {

        return ResponseEntity.ok(
                proveedorService.obtenerResumenComparativo()
        );
    }

    @GetMapping("/indicadores")
    public ResponseEntity<List<IndicadoresProveedorResponse>> obtenerIndicadoresProveedores() {

        return ResponseEntity.ok(
                proveedorService.obtenerIndicadoresProveedores()
        );
    }
}
