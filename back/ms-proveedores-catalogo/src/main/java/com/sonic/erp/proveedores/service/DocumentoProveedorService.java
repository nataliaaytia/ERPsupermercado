package com.sonic.erp.proveedores.service;

import com.sonic.erp.proveedores.dto.request.DocumentoProveedorRequest;
import com.sonic.erp.proveedores.entity.DocumentoProveedor;
import com.sonic.erp.proveedores.entity.Proveedor;
import com.sonic.erp.proveedores.repository.DocumentoProveedorRepository;
import com.sonic.erp.proveedores.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentoProveedorService {

    private final DocumentoProveedorRepository documentoProveedorRepository;
    private final ProveedorRepository proveedorRepository;

    public DocumentoProveedor registrarDocumento(
            Long idProveedor,
            DocumentoProveedorRequest request) {

        Proveedor proveedor = proveedorRepository.findById(idProveedor)
                .orElseThrow(() ->
                        new IllegalArgumentException("Proveedor no encontrado"));

        if (documentoProveedorRepository
                .existsByNumeroDocumento(request.getNumeroDocumento())) {
            throw new IllegalArgumentException(
                    "Ya existe un documento con ese número");
        }

        DocumentoProveedor documento = DocumentoProveedor.builder()
                .tipoDocumento(request.getTipoDocumento())
                .numeroDocumento(request.getNumeroDocumento())
                .fechaVencimiento(request.getFechaVencimiento())
                .archivo(request.getArchivo())
                .proveedor(proveedor)
                .build();

        return documentoProveedorRepository.save(documento);
    }

    @Transactional(readOnly = true)
    public List<DocumentoProveedor> listarPorProveedor(Long idProveedor) {

        if (!proveedorRepository.existsById(idProveedor)) {
            throw new IllegalArgumentException("Proveedor no encontrado");
        }

        return documentoProveedorRepository
                .findByProveedorIdProveedor(idProveedor);
    }
}