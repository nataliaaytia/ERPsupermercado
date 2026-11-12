package com.sonic.erp.ordenesdecompra.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record EditarRecepcionRequest(
        @NotNull(message = "La fecha es obligatoria")
        LocalDate fecha,

        @NotBlank(message = "El almacén es obligatorio")
        @Size(max = 100, message = "El almacén no puede superar 100 caracteres")
        String almacen,

        @Size(max = 500, message = "La observación no puede superar 500 caracteres")
        String observacion,

        @NotEmpty(message = "Debe incluir las líneas de recepción")
        List<@Valid DetalleRequest> detalles
) {
    public record DetalleRequest(
            @NotNull(message = "El identificador del detalle es obligatorio")
            @Positive(message = "El identificador del detalle debe ser positivo")
            Long idDetalle,

            @NotNull(message = "El producto es obligatorio")
            @Positive(message = "El identificador del producto debe ser positivo")
            Long productoId,

            @NotNull(message = "La cantidad recibida es obligatoria")
            @Positive(message = "La cantidad recibida debe ser positiva")
            Integer cantidadRecibida
    ) {
    }
}