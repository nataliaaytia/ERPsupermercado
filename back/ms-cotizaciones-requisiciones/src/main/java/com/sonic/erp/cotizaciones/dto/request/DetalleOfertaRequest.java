
package com.sonic.erp.cotizaciones.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record DetalleOfertaRequest(

        @NotNull(message = "El producto es obligatorio")
        @Positive(message = "El identificador del producto debe ser positivo")
        Long productoId,

        @NotNull(message = "La cantidad es obligatoria")
        @Positive(message = "La cantidad debe ser mayor que cero")
        Integer cantidad,

        @NotNull(message = "El precio es obligatorio")
        @DecimalMin(
                value = "0.0",
                inclusive = false,
                message = "El precio debe ser mayor que cero"
        )
        BigDecimal precio,

        @NotNull(message = "El plazo de entrega es obligatorio")
        @PositiveOrZero(message = "El plazo de entrega no puede ser negativo")
        Integer plazoEntrega

) {
}
