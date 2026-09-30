package com.sonic.erp.proveedores.repository;

import com.sonic.erp.proveedores.entity.EvaluacionProveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluacionProveedorRepository extends JpaRepository<EvaluacionProveedor, Long> {

    List<EvaluacionProveedor> findByProveedorIdProveedorOrderByFechaDesc(Long idProveedor);
}