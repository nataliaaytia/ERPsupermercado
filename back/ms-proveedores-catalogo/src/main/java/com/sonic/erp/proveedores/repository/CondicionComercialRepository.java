package com.sonic.erp.proveedores.repository;

import com.sonic.erp.proveedores.entity.CondicionComercial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CondicionComercialRepository extends JpaRepository<CondicionComercial, Long> {
    List<CondicionComercial> findByProveedor_IdProveedor(Long idProveedor);
    Optional<CondicionComercial> findFirstByProveedor_IdProveedorOrderByFechaRegistroDesc(Long idProveedor);
}