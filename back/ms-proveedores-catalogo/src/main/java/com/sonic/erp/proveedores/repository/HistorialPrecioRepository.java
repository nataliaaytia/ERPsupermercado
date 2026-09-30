package com.sonic.erp.proveedores.repository;

import com.sonic.erp.proveedores.entity.HistorialPrecio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistorialPrecioRepository extends JpaRepository<HistorialPrecio, Long> {

    // del mas reciente al mas antiguo por id
    List<HistorialPrecio> findByCatalogoComercial_IdCatalogoOrderByFechaCambioDesc(Long idCatalogo);

    // obtener historial por producto y proveedot
    List<HistorialPrecio> findByCatalogoComercial_Proveedor_IdProveedorAndCatalogoComercial_Producto_IdProductoOrderByFechaCambioDesc(
            Long idProveedor, Long idProducto);
}