package com.sonic.erp.ordenesdecompra.repository;

import com.sonic.erp.ordenesdecompra.entity.CompromisoContable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompromisoContableRepository extends JpaRepository<CompromisoContable, Long> {

    Optional<CompromisoContable> findByIdOrden(Long idOrden);
}