package com.sonic.erp.ordenesdecompra.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CerrarOrdenCompraRequest(
        @NotBlank(message = "Debe indicar el responsable del cierre")
        @Size(max = 100, message = "El responsable no puede superar 100 caracteres")
        String responsable
) {
}