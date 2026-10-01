package com.sonic.erp.proveedores.controller;

import com.sonic.erp.proveedores.dto.response.RankingProveedorResponse;
import com.sonic.erp.proveedores.service.RankingProveedorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proveedores/ranking")
@RequiredArgsConstructor
public class RankingProveedorController {

    private final RankingProveedorService rankingProveedorService;

    @GetMapping
    public ResponseEntity<List<RankingProveedorResponse>> obtenerRanking(
            @RequestParam(defaultValue = "ENTREGAS") String criterio,
            @RequestParam(defaultValue = "DESC") String orden) {

        List<RankingProveedorResponse> respuesta = rankingProveedorService.obtenerRanking(criterio, orden);
        return ResponseEntity.ok(respuesta);
    }
}