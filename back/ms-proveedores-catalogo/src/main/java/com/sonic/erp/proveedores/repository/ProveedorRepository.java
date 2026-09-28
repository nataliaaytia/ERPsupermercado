package com.sonic.erp.proveedores.repository;

import com.sonic.erp.proveedores.entity.Proveedor;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {
    boolean existsByNitRuc(@NotBlank String nitRuc);
}
