package com.sonic.erp.cotizaciones.repository;

import com.sonic.erp.cotizaciones.entity.ConsolidacionRequisiciones;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConsolidacionRequisicionesRepository
        extends JpaRepository<ConsolidacionRequisiciones, Long> {
}