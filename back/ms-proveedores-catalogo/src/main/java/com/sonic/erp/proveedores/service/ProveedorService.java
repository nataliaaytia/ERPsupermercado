package com.sonic.erp.proveedores.service;

import com.sonic.erp.proveedores.dto.request.ProveedorCreateRequest;
import com.sonic.erp.proveedores.entity.Proveedor;
import com.sonic.erp.proveedores.repository.ProveedorRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor

public class ProveedorService {

    private final ProveedorRepository proveedorRepository;

    @Transactional
    public Proveedor registrarProveedor(ProveedorCreateRequest request) {
        if (proveedorRepository.existsByNitRuc(request.getNitRuc())) {
            throw new IllegalArgumentException("Ya existe un proveedor con el mismo NIT o RUC");
        }
        Proveedor nuevoProveedor = Proveedor.builder()
                .nitRuc(request.getNitRuc())
                .razonSocial(request.getRazonSocial())
                .direccion(request.getDireccion())
                .telefono(request.getTelefono())
                .correo(request.getCorreo())
                .build();
        return proveedorRepository.save(nuevoProveedor);

    }
}
