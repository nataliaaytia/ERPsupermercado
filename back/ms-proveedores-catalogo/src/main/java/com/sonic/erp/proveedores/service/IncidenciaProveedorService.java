package com.sonic.erp.proveedores.service;

import com.sonic.erp.proveedores.dto.request.IncidenciaCreateRequest;
import com.sonic.erp.proveedores.entity.IncidenciaProveedor;
import com.sonic.erp.proveedores.entity.Proveedor;
import com.sonic.erp.proveedores.repository.IncidenciaProveedorRepository;
import com.sonic.erp.proveedores.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IncidenciaProveedorService {

    private final IncidenciaProveedorRepository incidenciaRepository;
    private final ProveedorRepository proveedorRepository;

    @Transactional
    public IncidenciaProveedor registrarIncidencia(IncidenciaCreateRequest request) {
        Proveedor proveedor = proveedorRepository.findById(request.getIdProveedor())
                .orElseThrow(() -> new IllegalArgumentException("No se encontro el proveedor con ID: " + request.getIdProveedor()));

        IncidenciaProveedor incidencia = IncidenciaProveedor.builder()
                .proveedor(proveedor)
                .tipo(request.getTipo())
                .descripcion(request.getDescripcion())
                .fecha(LocalDateTime.now())
                .build();

        return incidenciaRepository.save(incidencia);
    }

    public List<IncidenciaProveedor> listarPorProveedor(Long idProveedor) {
        if (!proveedorRepository.existsById(idProveedor)) {
            throw new IllegalArgumentException("No se encontro el proveedor con ID: " + idProveedor);
        }
        return incidenciaRepository.findByProveedor_IdProveedor(idProveedor);
    }
}