package com.sonic.erp.cotizaciones.repository;

import com.sonic.erp.cotizaciones.entity.OfertaProveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OfertaProveedorRepository extends JpaRepository<OfertaProveedor, Long> {

    @Query("SELECT DISTINCT o FROM OfertaProveedor o " +
            "LEFT JOIN FETCH o.detalles " +
            "WHERE o.solicitud.idSolicitud = :idSolicitud")
    List<OfertaProveedor> findBySolicitudIdConDetalles(@Param("idSolicitud") Long idSolicitud);

    @Query("SELECT DISTINCT o FROM OfertaProveedor o " +
            "LEFT JOIN FETCH o.detalles " +
            "WHERE o.solicitud.requisicion.idRequisicion = :idRequisicion")
    List<OfertaProveedor> findByRequisicionIdConDetalles(@Param("idRequisicion") Long idRequisicion);
}