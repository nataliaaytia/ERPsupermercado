package com.sonic.erp.ordenesdecompra.repository;

import com.sonic.erp.ordenesdecompra.entity.Recepcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecepcionRepository extends JpaRepository<Recepcion, Long> {

    boolean existsByIdOrden(Long idOrden);

    boolean existsByIdOrdenIsNull();

    List<Recepcion> findByIdOrden(Long idOrden);
}