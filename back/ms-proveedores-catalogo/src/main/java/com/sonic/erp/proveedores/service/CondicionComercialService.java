package com.sonic.erp.proveedores.service;

import com.sonic.erp.proveedores.dto.request.CondicionComercialCreateRequest;
import com.sonic.erp.proveedores.dto.response.CondicionComercialResponse;
import com.sonic.erp.proveedores.entity.CondicionComercial;
import com.sonic.erp.proveedores.entity.Proveedor;
import com.sonic.erp.proveedores.repository.CondicionComercialRepository;
import com.sonic.erp.proveedores.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CondicionComercialService {

    private final CondicionComercialRepository condicionRepository;
    private final ProveedorRepository proveedorRepository;

    @Transactional
    public CondicionComercial registrarCondicion(CondicionComercialCreateRequest request) {
        Proveedor proveedor = proveedorRepository.findById(request.getIdProveedor())
                .orElseThrow(() -> new IllegalArgumentException("No se encontro el proveedor con ID: " + request.getIdProveedor()));

        CondicionComercial condicion = CondicionComercial.builder()
                .proveedor(proveedor)
                .formaPago(request.getFormaPago())
                .diasCredito(request.getDiasCredito() != null ? request.getDiasCredito() : 0)
                .montoMinimoCompra(request.getMontoMinimoCompra() != null ? request.getMontoMinimoCompra() : BigDecimal.ZERO)
                .plazoEntregaDias(request.getPlazoEntregaDias())
                .observaciones(request.getObservaciones())
                .build();

        return condicionRepository.save(condicion);
    }

    public List<CondicionComercialResponse> listarPorProveedor(Long idProveedor) {
        if (!proveedorRepository.existsById(idProveedor)) {
            throw new IllegalArgumentException("No se encontro el proveedor con ID: " + idProveedor);
        }

        return condicionRepository.findByProveedor_IdProveedor(idProveedor).stream()
                .map(c -> CondicionComercialResponse.builder()
                        .idCondicion(c.getIdCondicion())
                        .idProveedor(c.getProveedor().getIdProveedor())
                        .formaPago(c.getFormaPago())
                        .diasCredito(c.getDiasCredito())
                        .montoMinimoCompra(c.getMontoMinimoCompra())
                        .plazoEntregaDias(c.getPlazoEntregaDias())
                        .observaciones(c.getObservaciones())
                        .fechaRegistro(c.getFechaRegistro())
                        .build())
                .toList();
    }
}