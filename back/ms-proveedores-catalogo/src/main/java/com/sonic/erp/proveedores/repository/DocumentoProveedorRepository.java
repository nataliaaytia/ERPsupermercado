package com.sonic.erp.proveedores.repository;

import com.sonic.erp.proveedores.entity.DocumentoProveedor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface DocumentoProveedorRepository extends JpaRepository<DocumentoProveedor, Long> {

    List<DocumentoProveedor> findByProveedorIdProveedor(Long idProveedor);

    boolean existsByNumeroDocumento(String numeroDocumento);

    List<DocumentoProveedor> findByFechaVencimientoBetween(
            LocalDate fechaInicio,
            LocalDate fechaFin
    );
}