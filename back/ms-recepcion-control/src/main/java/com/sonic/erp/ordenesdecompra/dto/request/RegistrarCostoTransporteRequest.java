package com.sonic.erp.ordenesdecompra.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record RegistrarCostoTransporteRequest(
        @NotNull(message = "El importe es obligatorio")
        @DecimalMin(value = "0.00", message = "El importe no puede ser negativo")
        @Digits(integer = 10, fraction = 2,
                message = "El importe admite hasta 10 enteros y 2 decimales")
        BigDecimal importe,

        @NotBlank(message = "El concepto es obligatorio")
        @Size(max = 255, message = "El concepto no puede superar 255 caracteres")
        String concepto,

        @NotBlank(message = "El comprobante de transporte es obligatorio")
        @Size(max = 100, message = "El comprobante no puede superar 100 caracteres")
        String comprobante
) {
}