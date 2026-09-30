package com.sonic.erp.proveedores.service;

import com.sonic.erp.proveedores.dto.response.CumplimientoEntregasResponse;
import com.sonic.erp.proveedores.entity.Proveedor;
import com.sonic.erp.proveedores.entity.RecepcionMercaderia;
import com.sonic.erp.proveedores.repository.ProveedorRepository;
import com.sonic.erp.proveedores.repository.RecepcionMercaderiaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CumplimientoEntregasService {

    private final ProveedorRepository proveedorRepository;
    private final RecepcionMercaderiaRepository recepcionMercaderiaRepository;

    public CumplimientoEntregasResponse obtenerCumplimientoEntregas(
            Long idProveedor) {

        Proveedor proveedor = proveedorRepository.findById(idProveedor)
                .orElseThrow(() ->
                        new IllegalArgumentException("Proveedor no encontrado")
                );

        List<RecepcionMercaderia> recepciones =
                recepcionMercaderiaRepository
                        .findByProveedor_IdProveedor(idProveedor);

        int totalOrdenes = recepciones.size();

        int ordenesCompletas = (int) recepciones.stream()
                .filter(recepcion ->
                        recepcion.getCantidadRecibida()
                                >= recepcion.getCantidadSolicitada())
                .count();

        int ordenesIncompletas = totalOrdenes - ordenesCompletas;

        double porcentajeEntregasCompletas = totalOrdenes > 0
                ? Math.round(
                        ((double) ordenesCompletas / totalOrdenes) * 10000
                    ) / 100.0
                : 0.0;
        return CumplimientoEntregasResponse.builder()
                .idProveedor(proveedor.getIdProveedor())
                .razonSocial(proveedor.getRazonSocial())
                .totalOrdenes(totalOrdenes)
                .ordenesCompletas(ordenesCompletas)
                .ordenesIncompletas(ordenesIncompletas)
                .porcentajeEntregasCompletas(porcentajeEntregasCompletas)
                .build();
    }
}