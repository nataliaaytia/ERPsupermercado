package com.sonic.erp.ordenesdecompra.repository;

import com.sonic.erp.ordenesdecompra.entity.Recepcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RecepcionRepository extends JpaRepository<Recepcion, Long> {

    boolean existsByIdOrden(Long idOrden);

    boolean existsByIdOrdenIsNull();

    boolean existsByDocumentoIgnoreCase(String documento);

    List<Recepcion> findByIdOrden(Long idOrden);

    List<Recepcion> findByIdOrdenIn(List<Long> idOrdenes);

    @Query("""
            SELECT r
            FROM Recepcion r
            WHERE (:idOrden IS NULL OR r.idOrden = :idOrden)
              AND (:desde IS NULL OR r.fecha >= :desde)
              AND (:hasta IS NULL OR r.fecha <= :hasta)
            ORDER BY r.fecha DESC, r.idRecepcion DESC
            """)
    List<Recepcion> buscar(
            @Param("idOrden") Long idOrden,
            @Param("desde") LocalDate desde,
            @Param("hasta") LocalDate hasta
    );
}