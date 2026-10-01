package com.sonic.erp.proveedores.service;

import com.sonic.erp.proveedores.dto.response.CalidadProveedorResponse;
import com.sonic.erp.proveedores.entity.InspeccionMercaderia;
import com.sonic.erp.proveedores.entity.Proveedor;
import com.sonic.erp.proveedores.repository.InspeccionMercaderiaRepository;
import com.sonic.erp.proveedores.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CalidadProveedorService {

    private final ProveedorRepository proveedorRepository;
    private final InspeccionMercaderiaRepository inspeccionMercaderiaRepository;

    public CalidadProveedorResponse obtenerCalidadProveedor(Long idProveedor) {

        Proveedor proveedor = proveedorRepository.findById(idProveedor)
                .orElseThrow(() ->
                        new IllegalArgumentException("Proveedor no encontrado")
                );

        List<InspeccionMercaderia> inspecciones =
                inspeccionMercaderiaRepository
                        .findByProveedor_IdProveedor(idProveedor);

        int totalInspeccionados = inspecciones.stream()
                .mapToInt(InspeccionMercaderia::getCantidadInspeccionada)
                .sum();

        int totalAceptados = inspecciones.stream()
                .mapToInt(InspeccionMercaderia::getCantidadAceptada)
                .sum();

        double porcentajeAceptados = totalInspeccionados > 0
                ? ((double) totalAceptados / totalInspeccionados) * 100
                : 0.0;

        return CalidadProveedorResponse.builder()
                .idProveedor(proveedor.getIdProveedor())
                .razonSocial(proveedor.getRazonSocial())
                .totalProductosInspeccionados(totalInspeccionados)
                .totalProductosAceptados(totalAceptados)
                .porcentajeAceptados(porcentajeAceptados)
                .build();
    }
}