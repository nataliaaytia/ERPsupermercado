package com.sonic.erp.proveedores.repository;

import com.sonic.erp.proveedores.entity.Proveedor;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {
    //Para la creacion
    boolean existsByNitRuc(@NotBlank String nitRuc);

    //Para que al momento de actualizar no se pueda a una que ya existe
    boolean existsByNitRucAndIdProveedorNot(String nitRuc, Long idProveedor);
}
