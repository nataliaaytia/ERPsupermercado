package com.sonic.erp.proveedores.service;

import com.sonic.erp.proveedores.dto.request.ProveedorCreateRequest;
import com.sonic.erp.proveedores.dto.request.ProveedorUpdateRequest;
import com.sonic.erp.proveedores.entity.Proveedor;
import com.sonic.erp.proveedores.repository.ProveedorRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.sonic.erp.proveedores.dto.response.ProveedorValidacionResponse;
import java.time.LocalDateTime;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

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


    @Transactional
    public Proveedor actualizarProveedor(Long id, ProveedorUpdateRequest request) {
        Proveedor proveedor = proveedorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No se encontro el proveedor con el ID: " + id));

        if (request.getNitRuc() != null && !request.getNitRuc().isBlank()) {
            if (proveedorRepository.existsByNitRucAndIdProveedorNot(request.getNitRuc(), id)) {
                throw new IllegalArgumentException("El NIT o RUC ya esta registrado para otro proveedor");
            }
            proveedor.setNitRuc(request.getNitRuc());
        }

        if (request.getRazonSocial() != null && !request.getRazonSocial().isBlank()) {
            proveedor.setRazonSocial(request.getRazonSocial());
        }

        if (request.getDireccion() != null && !request.getDireccion().isBlank()) {
            proveedor.setDireccion(request.getDireccion());
        }

        if (request.getTelefono() != null && !request.getTelefono().isBlank()) {
            proveedor.setTelefono(request.getTelefono());
        }

        if (request.getCorreo() != null && !request.getCorreo().isBlank()) {
            proveedor.setCorreo(request.getCorreo());
        }

        if (request.getEstado() != null && !request.getEstado().isBlank()) {
            proveedor.setEstado(request.getEstado());
        }

        return proveedorRepository.save(proveedor);
    }

    public ProveedorValidacionResponse validarProveedor(Long idProveedor) {

        Proveedor proveedor = proveedorRepository.findById(idProveedor)
                .orElseThrow(() ->
                        new IllegalArgumentException("Proveedor no encontrado"));

        List<String> errores = new ArrayList<>();

        if (proveedor.getNitRuc() == null || proveedor.getNitRuc().isBlank()) {
            errores.add("El NIT o RUC es obligatorio");
        }

        if (proveedor.getRazonSocial() == null || proveedor.getRazonSocial().isBlank()) {
            errores.add("La razon social es obligatoria");
        }

        if (proveedor.getDireccion() == null || proveedor.getDireccion().isBlank()) {
            errores.add("La direccion es obligatoria");
        }

        if (proveedor.getTelefono() == null || proveedor.getTelefono().isBlank()) {
            errores.add("El telefono es obligatorio");
        }

        if (proveedor.getCorreo() == null || proveedor.getCorreo().isBlank()) {
            errores.add("El correo es obligatorio");
        } else {
            String expresionCorreo = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";

            if (!Pattern.matches(expresionCorreo, proveedor.getCorreo())) {
                errores.add("El correo electronico no tiene un formato valido");
            }
        }

        boolean valido = errores.isEmpty();

        proveedor.setValidado(valido);
        proveedor.setFechaValidacion(LocalDateTime.now());
        proveedorRepository.save(proveedor);

        return ProveedorValidacionResponse.builder()
                .idProveedor(proveedor.getIdProveedor())
                .valido(valido)
                .mensaje(valido
                        ? "Proveedor validado correctamente"
                        : "El proveedor no cumple con la informacion requerida")
                .errores(errores)
                .build();
    }

    @Transactional
    public Proveedor actualizarEstado(Long idProveedor, String nuevoEstado) {

        Proveedor proveedor = proveedorRepository.findById(idProveedor)
                .orElseThrow(() ->
                        new IllegalArgumentException("Proveedor no encontrado"));

        List<String> estadosPermitidos = List.of(
                "Registrado",
                "Activo",
                "Inactivo"
        );

        if (nuevoEstado == null || !estadosPermitidos.contains(nuevoEstado)) {
            throw new IllegalArgumentException(
                    "Estado no válido. Los estados permitidos son: Registrado, Activo e Inactivo"
            );
        }

        proveedor.setEstado(nuevoEstado);

        return proveedorRepository.save(proveedor);
    }

    public List<Proveedor> listarProveedores() {
        return proveedorRepository.findAll();
    }

    public Proveedor obtenerProveedorPorId(Long id) {
        return proveedorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No se encontro el proveedor con el ID: " + id));
    }


}
