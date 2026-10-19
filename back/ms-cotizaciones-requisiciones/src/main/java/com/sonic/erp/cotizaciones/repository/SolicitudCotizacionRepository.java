
package com.sonic.erp.cotizaciones.repository;

import com.sonic.erp.cotizaciones.entity.SolicitudCotizacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudCotizacionRepository
        extends JpaRepository<SolicitudCotizacion, Long> {

    List<SolicitudCotizacion> findByEstadoIgnoreCase(String estado);

}
