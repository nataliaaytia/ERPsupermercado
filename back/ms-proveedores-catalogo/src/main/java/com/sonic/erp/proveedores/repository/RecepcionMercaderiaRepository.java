package com.sonic.erp.proveedores.repository;

import com.sonic.erp.proveedores.entity.RecepcionMercaderia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecepcionMercaderiaRepository
        extends JpaRepository<RecepcionMercaderia, Long> {

    List<RecepcionMercaderia> findByProveedor_IdProveedor(Long idProveedor);
}
