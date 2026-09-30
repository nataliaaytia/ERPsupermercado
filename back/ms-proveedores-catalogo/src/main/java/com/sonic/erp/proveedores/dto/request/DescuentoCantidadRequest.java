package com.sonic.erp.proveedores.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class DescuentoCantidadRequest {
    @NotNull(message = "El ID del catalogo comercial es obligatorio")
    private Long idCatalogo;

    @NotNull(message = "La cantidad minima es obligatoria")
    @Min(value = 1, message = "La cantidad minima debe ser al menos 1")
    private Integer cantidadMinima;

    @Min(value = 1, message = "La cantidad maxima debe ser al menos 1")
    private Integer cantidadMaxima;

    @NotNull(message = "El porcentaje de descuento es obligatorio")
    @DecimalMin(value = "0.01", message = "El descuento debe ser mayor a 0%")
    @DecimalMax(value = "100.00", message = "El descuento no puede superar el 100%")
    private BigDecimal porcentajeDescuento;
}