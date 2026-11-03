package com.sonic.erp.ordenesdecompra.repository;

import com.sonic.erp.ordenesdecompra.entity.DetalleRecepcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DetalleRecepcionRepository extends JpaRepository<DetalleRecepcion, Long> {
}