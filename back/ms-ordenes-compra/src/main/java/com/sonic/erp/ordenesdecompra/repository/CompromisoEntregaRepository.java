package com.sonic.erp.ordenesdecompra.repository;

import com.sonic.erp.ordenesdecompra.entity.CompromisoEntrega;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CompromisoEntregaRepository
        extends JpaRepository<CompromisoEntrega, Long> {

    @Query("""
            SELECT COALESCE(SUM(c.cantidad), 0)
            FROM CompromisoEntrega c
            WHERE c.detalleOrden.idDetalle = :idDetalle
            """)
    Long sumarCantidadComprometidaPorDetalle(
            @Param("idDetalle") Long idDetalle
    );
}