package com.sonic.erp.proveedores.repository;

import com.sonic.erp.proveedores.entity.InspeccionMercaderia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InspeccionMercaderiaRepository
        extends JpaRepository<InspeccionMercaderia, Long> {
    List<InspeccionMercaderia> findByProveedor_IdProveedor(Long idProveedor);
}