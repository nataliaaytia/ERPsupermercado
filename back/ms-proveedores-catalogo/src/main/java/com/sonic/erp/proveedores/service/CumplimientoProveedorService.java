package com.sonic.erp.proveedores.service;

import com.sonic.erp.proveedores.dto.response.CumplimientoPlazosResponse;
import com.sonic.erp.proveedores.entity.Proveedor;
import com.sonic.erp.proveedores.entity.RecepcionMercaderia;
import com.sonic.erp.proveedores.repository.ProveedorRepository;
import com.sonic.erp.proveedores.repository.RecepcionMercaderiaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CumplimientoProveedorService {

    private final RecepcionMercaderiaRepository recepcionRepository;
    private final ProveedorRepository proveedorRepository;

    @Transactional(readOnly = true)
    public CumplimientoPlazosResponse consultarCumplimientoPlazos(Long idProveedor) {
        Proveedor proveedor = proveedorRepository.findById(idProveedor)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado con ID: " + idProveedor));

        List<RecepcionMercaderia> recepciones = recepcionRepository.findByProveedor_IdProveedor(idProveedor);

        int total = recepciones.size();
        if (total == 0) {
            return CumplimientoPlazosResponse.builder()
                    .idProveedor(proveedor.getIdProveedor())
                    .razonSocial(proveedor.getRazonSocial())
                    .totalEntregas(0)
                    .entregasATiempo(0)
                    .entregasRetrasadas(0)
                    .porcentajeEntregasATiempo(0.0)
                    .build();
        }

        int aTiempo = (int) recepciones.stream()
                .filter(r -> r.getFechaComprometida() != null
                        && !r.getFechaRecepcion().isAfter(r.getFechaComprometida()))
                .count();

        int conRetraso = total - aTiempo;

        double porcentaje = BigDecimal.valueOf(((double) aTiempo / total) * 100)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();

        return CumplimientoPlazosResponse.builder()
                .idProveedor(proveedor.getIdProveedor())
                .razonSocial(proveedor.getRazonSocial())
                .totalEntregas(total)
                .entregasATiempo(aTiempo)
                .entregasRetrasadas(conRetraso)
                .porcentajeEntregasATiempo(porcentaje)
                .build();
    }
}