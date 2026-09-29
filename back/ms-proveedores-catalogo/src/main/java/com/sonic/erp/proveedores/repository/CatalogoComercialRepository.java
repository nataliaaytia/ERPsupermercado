package com.sonic.erp.proveedores.repository;

import com.sonic.erp.proveedores.entity.CatalogoComercial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CatalogoComercialRepository extends JpaRepository<CatalogoComercial, Long> {
    List<CatalogoComercial> findByProveedor_IdProveedor(Long idProveedor);
}