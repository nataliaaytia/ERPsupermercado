package com.sonic.erp.proveedores.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CondicionComercialCreateRequest {

    @NotNull(message = "El ID del proveedor es obligatorio")
    private Long idProveedor;

    @NotBlank(message = "La forma de pago es obligatoria")
    @Size(max = 50, message = "La forma de pago no debe superar los 50 caracteres")
    private String formaPago;

    @Min(value = 0, message = "Los dias de credito no pueden ser negativos")
    private Integer diasCredito;

    @DecimalMin(value = "0.0", inclusive = true, message = "El monto minimo no puede ser negativo")
    private BigDecimal montoMinimoCompra;

    @NotNull(message = "El plazo de entrega en dias es obligatorio")
    @Min(value = 0, message = "El plazo de entrega no puede ser negativo")
    private Integer plazoEntregaDias;

    @Size(max = 250, message = "Las observaciones no deben superar los 250 caracteres")
    private String observaciones;
}