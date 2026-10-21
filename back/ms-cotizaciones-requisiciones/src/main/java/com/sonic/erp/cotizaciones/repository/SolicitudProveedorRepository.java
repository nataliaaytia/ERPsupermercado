
package com.sonic.erp.cotizaciones.repository;

import com.sonic.erp.cotizaciones.entity.SolicitudProveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudProveedorRepository
        extends JpaRepository<SolicitudProveedor, Long> {

    boolean existsBySolicitud_IdSolicitudAndProveedorId(
            Long idSolicitud,
            Long proveedorId
    );

    List<SolicitudProveedor> findBySolicitud_IdSolicitud(
            Long idSolicitud
    );
}
