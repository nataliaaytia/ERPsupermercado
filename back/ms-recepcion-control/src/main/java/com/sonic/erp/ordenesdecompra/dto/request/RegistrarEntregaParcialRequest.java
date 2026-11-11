package com.sonic.erp.ordenesdecompra.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record RegistrarEntregaParcialRequest(
        @NotNull(message = "La fecha es obligatoria")
        LocalDate fecha,

        @NotBlank(message = "El almacén es obligatorio")
        @Size(max = 100, message = "El almacén no puede superar 100 caracteres")
        String almacen,

        @Size(max = 500, message = "La observación no puede superar 500 caracteres")
        String observacion,

        @NotEmpty(message = "Debe incluir al menos una línea")
        List<@Valid LineaEntregaRequest> detalles
) {
    public record LineaEntregaRequest(
            @NotNull(message = "El producto es obligatorio")
            @Positive(message = "El producto debe ser válido")
            Long productoId,

            @NotNull(message = "La cantidad es obligatoria")
            @Positive(message = "La cantidad debe ser positiva")
            Integer cantidadRecibida
    ) {
    }
}