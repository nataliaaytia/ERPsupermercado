package com.sonic.erp.ordenesdecompra.repository;

import com.sonic.erp.ordenesdecompra.entity.CompromisoEntrega;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompromisoEntregaRepository
        extends JpaRepository<CompromisoEntrega, Long> {

    @Query("""
            SELECT COALESCE(SUM(c.cantidad), 0)
            FROM CompromisoEntrega c
            WHERE c.detalleOrden.idDetalle = :idDetalle
            """)
    Long sumarCantidadComprometidaPorDetalle(Long idDetalle);

    @Query("""
            SELECT c
            FROM CompromisoEntrega c
            JOIN FETCH c.detalleOrden d
            JOIN FETCH d.ordenCompra o
            WHERE UPPER(c.estado) = 'PROGRAMADO'
              AND UPPER(o.estado) NOT IN ('ANULADA', 'CERRADA')
            ORDER BY c.fechaEntrega ASC, c.idCompromiso ASC
            """)
    List<CompromisoEntrega> buscarProgramadosDeOrdenesVigentes();
}