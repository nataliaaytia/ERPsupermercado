package com.sonic.erp.proveedores.repository;

import com.sonic.erp.proveedores.entity.IncidenciaProveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidenciaProveedorRepository extends JpaRepository<IncidenciaProveedor, Long> {

    List<IncidenciaProveedor> findByProveedor_IdProveedor(Long idProveedor);

    @Query("""
            SELECT
                i.proveedor.idProveedor,
                i.proveedor.razonSocial,
                COUNT(i)
            FROM IncidenciaProveedor i
            WHERE LOWER(i.tipo) = LOWER('Retraso')
            GROUP BY i.proveedor.idProveedor, i.proveedor.razonSocial
            ORDER BY COUNT(i) DESC
            """)
    List<Object[]> contarRetrasosPorProveedor();
}