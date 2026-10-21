package com.sonic.erp.cotizaciones.repository;

import com.sonic.erp.cotizaciones.entity.DetalleConsolidacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DetalleConsolidacionRepository
        extends JpaRepository<DetalleConsolidacion, Long> {
}