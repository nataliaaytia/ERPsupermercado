package com.sonic.erp.proveedores.repository;

import com.sonic.erp.proveedores.entity.DescuentoCantidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DescuentoCantidadRepository extends JpaRepository<DescuentoCantidad, Long> {

    List<DescuentoCantidad> findByCatalogoComercial_IdCatalogo(Long idCatalogo);

    List<DescuentoCantidad> findAllByOrderByPorcentajeDescuentoDesc();
}