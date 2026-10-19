package com.sonic.erp.proveedores.repository;

import com.sonic.erp.proveedores.entity.RecepcionMercaderia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

@Repository
public interface RecepcionMercaderiaRepository
        extends JpaRepository<RecepcionMercaderia, Long> {

    List<RecepcionMercaderia> findByProveedor_IdProveedor(Long idProveedor);

    @Query("""
    SELECT EXTRACT(MONTH FROM r.fechaRecepcion),
           COUNT(DISTINCT r.numeroOrden)
    FROM RecepcionMercaderia r
    GROUP BY EXTRACT(MONTH FROM r.fechaRecepcion)
    ORDER BY EXTRACT(MONTH FROM r.fechaRecepcion)
""")
    List<Object[]> obtenerFrecuenciaMensual();
}
