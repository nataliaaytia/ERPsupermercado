package com.sonic.erp.ordenesdecompra.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record AprobarOrdenCompraRequest(
        @NotBlank(message = "Debe indicar el usuario que aprueba")
        @Size(max = 100, message = "El usuario no puede superar 100 caracteres")
        String usuario,

        @NotBlank(message = "Debe indicar el rol del usuario que aprueba")
        String rol,

        @NotNull(message = "Debe indicar el límite autorizado")
        @PositiveOrZero(message = "El límite autorizado no puede ser negativo")
        BigDecimal limiteAutorizado
) {
}
