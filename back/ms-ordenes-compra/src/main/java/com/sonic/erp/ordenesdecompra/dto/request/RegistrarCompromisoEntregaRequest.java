package com.sonic.erp.ordenesdecompra.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record RegistrarCompromisoEntregaRequest(

        @NotNull(message = "La fecha de entrega es obligatoria")
        LocalDate fechaEntrega,

        @NotNull(message = "La cantidad es obligatoria")
        @Positive(message = "La cantidad debe ser mayor que cero")
        Integer cantidad,

        @Size(max = 255, message = "La observación no puede superar 255 caracteres")
        String observacion
) {
}