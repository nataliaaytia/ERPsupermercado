package com.sonic.erp.ordenesdecompra.repository;

import com.sonic.erp.ordenesdecompra.entity.Discrepancia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiscrepanciaRepository extends JpaRepository<Discrepancia, Long> {
    List<Discrepancia> findByDetalleRecepcionIdDetalle(Long idDetalle);
}