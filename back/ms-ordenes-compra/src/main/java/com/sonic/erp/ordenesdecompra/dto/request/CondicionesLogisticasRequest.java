package com.sonic.erp.ordenesdecompra.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CondicionesLogisticasRequest(
        @NotBlank(message = "El destino de entrega es obligatorio")
        @Size(max = 255, message = "El destino no puede superar 255 caracteres")
        String destinoEntrega,

        @NotBlank(message = "El horario de entrega es obligatorio")
        @Size(max = 100, message = "El horario no puede superar 100 caracteres")
        String horarioEntrega,

        @NotBlank(message = "El responsable de entrega es obligatorio")
        @Size(max = 100, message = "El responsable no puede superar 100 caracteres")
        String responsableEntrega
) {
}