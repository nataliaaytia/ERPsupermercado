package com.sonic.erp.proveedores.service;

import com.sonic.erp.proveedores.dto.response.ProductosDefectuososResponse;
import com.sonic.erp.proveedores.dto.response.ProductosDefectuososResponse.DetalleProductoDefectuosoDTO;
import com.sonic.erp.proveedores.entity.InspeccionMercaderia;
import com.sonic.erp.proveedores.entity.Proveedor;
import com.sonic.erp.proveedores.repository.InspeccionMercaderiaRepository;
import com.sonic.erp.proveedores.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductosDefectuososService {

    private final ProveedorRepository proveedorRepository;
    private final InspeccionMercaderiaRepository inspeccionMercaderiaRepository;

    @Transactional(readOnly = true)
    public ProductosDefectuososResponse obtenerProductosDefectuosos(Long idProveedor) {

        Proveedor proveedor = proveedorRepository.findById(idProveedor)
                .orElseThrow(() -> new IllegalArgumentException("Proveedor no encontrado con ID: " + idProveedor));

        List<InspeccionMercaderia> inspecciones = inspeccionMercaderiaRepository.findByProveedor_IdProveedor(idProveedor);

        if (inspecciones.isEmpty()) {
            return ProductosDefectuososResponse.builder()
                    .idProveedor(proveedor.getIdProveedor())
                    .razonSocial(proveedor.getRazonSocial())
                    .totalProductosInspeccionados(0)
                    .totalProductosAceptados(0)
                    .totalProductosDefectuosos(0)
                    .porcentajeDefectuosos(0.0)
                    .detalleProductos(new ArrayList<>())
                    .build();
        }

        int totalInspeccionados = 0;
        int totalAceptados = 0;
        int totalDefectuosos = 0;
        List<DetalleProductoDefectuosoDTO> detalles = new ArrayList<>();

        for (InspeccionMercaderia ins : inspecciones) {
            int insp = ins.getCantidadInspeccionada() != null ? ins.getCantidadInspeccionada() : 0;
            int acept = ins.getCantidadAceptada() != null ? ins.getCantidadAceptada() : 0;
            int defect = Math.max(0, insp - acept);

            totalInspeccionados += insp;
            totalAceptados += acept;
            totalDefectuosos += defect;

            detalles.add(DetalleProductoDefectuosoDTO.builder()
                    .idProducto(ins.getProducto() != null ? ins.getProducto().getIdProducto() : null)
                    .descripcion(ins.getProducto() != null ? ins.getProducto().getDescripcion() : "Sin descripción")
                    .cantidadInspeccionada(insp)
                    .cantidadAceptada(acept)
                    .cantidadDefectuosa(defect)
                    .build());
        }

        double porcentajeDefectuosos = totalInspeccionados > 0
                ? BigDecimal.valueOf(((double) totalDefectuosos / totalInspeccionados) * 100)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue()
                : 0.0;

        return ProductosDefectuososResponse.builder()
                .idProveedor(proveedor.getIdProveedor())
                .razonSocial(proveedor.getRazonSocial())
                .totalProductosInspeccionados(totalInspeccionados)
                .totalProductosAceptados(totalAceptados)
                .totalProductosDefectuosos(totalDefectuosos)
                .porcentajeDefectuosos(porcentajeDefectuosos)
                .detalleProductos(detalles)
                .build();
    }
}