
package com.sonic.erp.ordenesdecompra.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;

public record EditarOrdenCompraRequest(

        @NotEmpty(message = "La orden debe contener al menos un producto")
        List<@Valid Linea> detalles

) {

    public record Linea(

            @NotNull(message = "El ID del producto es obligatorio")
            @Positive(message = "El ID del producto debe ser positivo")
            Long productoId,

            @NotNull(message = "La cantidad es obligatoria")
            @Positive(message = "La cantidad debe ser mayor a cero")
            Integer cantidad

    ) {
    }
}
