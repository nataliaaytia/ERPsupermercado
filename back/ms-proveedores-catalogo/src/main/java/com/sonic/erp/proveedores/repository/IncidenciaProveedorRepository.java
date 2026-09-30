package com.sonic.erp.proveedores.repository;

import com.sonic.erp.proveedores.entity.IncidenciaProveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidenciaProveedorRepository extends JpaRepository<IncidenciaProveedor, Long> {

    List<IncidenciaProveedor> findByProveedor_IdProveedor(Long idProveedor);

    // Ranking de proveedores según cantidad de retrasos
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

    // Datos necesarios para calcular el porcentaje de cumplimiento
    @Query("""
            SELECT
                i.proveedor.idProveedor,
                i.proveedor.razonSocial,
                COUNT(i),
                SUM(
                    CASE
                        WHEN LOWER(i.tipo) = LOWER('Retraso') THEN 1
                        ELSE 0
                    END
                )
            FROM IncidenciaProveedor i
            GROUP BY i.proveedor.idProveedor, i.proveedor.razonSocial
            """)
    List<Object[]> obtenerDatosCumplimiento();
}