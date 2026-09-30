package com.sonic.erp.proveedores.repository;

import com.sonic.erp.proveedores.entity.CatalogoComercial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CatalogoComercialRepository extends JpaRepository<CatalogoComercial, Long> {

    List<CatalogoComercial> findByProveedor_IdProveedor(Long idProveedor);

    List<CatalogoComercial> findByProveedor_IdProveedorAndProducto_IdProducto(
            Long idProveedor,
            Long idProducto
    );

    List<CatalogoComercial> findByProducto_IdProducto(Long idProducto);
}