
package com.sonic.erp.ordenesdecompra.repository;

import com.sonic.erp.ordenesdecompra.entity.OrdenCompra;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrdenCompraRepository
        extends JpaRepository<OrdenCompra, Long>,
        JpaSpecificationExecutor<OrdenCompra> {

    boolean existsByIdOferta(Long idOferta);

    Optional<OrdenCompra> findByIdOferta(Long idOferta);
}
