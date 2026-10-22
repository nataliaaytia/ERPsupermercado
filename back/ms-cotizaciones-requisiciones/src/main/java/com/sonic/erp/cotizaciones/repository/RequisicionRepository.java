package com.sonic.erp.cotizaciones.repository;

import com.sonic.erp.cotizaciones.entity.Requisicion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RequisicionRepository extends JpaRepository<Requisicion, Long> {
    Optional<Requisicion> findByAlertaId(String alertaId);
    boolean existsByAlertaId(String alertaId);
}