package com.sonic.erp.proveedores.repository;

import com.sonic.erp.proveedores.entity.IncidenciaProveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidenciaProveedorRepository extends JpaRepository<IncidenciaProveedor, Long> {

    List<IncidenciaProveedor> findByProveedor_IdProveedor(Long idProveedor);
}