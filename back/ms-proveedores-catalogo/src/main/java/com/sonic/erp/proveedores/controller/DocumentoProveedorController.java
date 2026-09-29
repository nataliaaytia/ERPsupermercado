package com.sonic.erp.proveedores.controller;

import com.sonic.erp.proveedores.dto.request.DocumentoProveedorRequest;
import com.sonic.erp.proveedores.entity.DocumentoProveedor;
import com.sonic.erp.proveedores.service.DocumentoProveedorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/proveedores/{idProveedor}/documentos")
@RequiredArgsConstructor
public class DocumentoProveedorController {

    private final DocumentoProveedorService documentoProveedorService;

    @PostMapping
    public ResponseEntity<DocumentoProveedor> registrarDocumento(
            @PathVariable Long idProveedor,
            @RequestBody DocumentoProveedorRequest request) {

        DocumentoProveedor documento =
                documentoProveedorService.registrarDocumento(
                        idProveedor, request);

        return ResponseEntity.ok(documento);
    }

    @GetMapping
    public ResponseEntity<List<DocumentoProveedor>> listarDocumentos(
            @PathVariable Long idProveedor) {

        return ResponseEntity.ok(
                documentoProveedorService.listarPorProveedor(idProveedor));
    }
}