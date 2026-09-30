package com.sonic.erp.proveedores.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class DescuentoCantidadResponse {
    private Long idDescuento;
    private Long idCatalogo;
    private Integer cantidadMinima;
    private Integer cantidadMaxima;
    private BigDecimal porcentajeDescuento;
}