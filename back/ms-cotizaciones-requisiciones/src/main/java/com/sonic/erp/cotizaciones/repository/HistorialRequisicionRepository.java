
package com.sonic.erp.cotizaciones.repository;

import com.sonic.erp.cotizaciones.entity.HistorialRequisicion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistorialRequisicionRepository
        extends JpaRepository<HistorialRequisicion, Long> {

    List<HistorialRequisicion>
    findByIdRequisicionOrderByFechaCambioDesc(Long idRequisicion);
}
