
package com.sonic.erp.ordenesdecompra.repository;

import com.sonic.erp.ordenesdecompra.entity.OrdenCompra;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM OrdenCompra o WHERE o.idOrden = :idOrden")
    Optional<OrdenCompra> findByIdForUpdate(
            @Param("idOrden") Long idOrden
    );

}
