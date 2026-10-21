
package com.sonic.erp.cotizaciones.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;

public record AsociarProveedoresRequest(

        @NotEmpty(message = "Debe seleccionar al menos un proveedor")
        List<
                @NotNull(message = "El ID del proveedor es obligatorio")
                @Positive(message = "El ID del proveedor debe ser positivo")
                        Long
                > proveedoresIds

) {
}
