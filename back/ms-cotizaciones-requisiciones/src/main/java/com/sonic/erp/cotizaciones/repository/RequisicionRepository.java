
package com.sonic.erp.cotizaciones.repository;

import com.sonic.erp.cotizaciones.entity.Requisicion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RequisicionRepository extends JpaRepository<Requisicion, Long> {

}
