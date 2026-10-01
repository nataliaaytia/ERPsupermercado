package com.sonic.erp.proveedores.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IndicadoresProveedorResponse {

    private Long idProveedor;
    private String razonSocial;

    private Double porcentajeCumplimiento;
    private Double porcentajeCalidad;

    private Long cantidadRetrasos;

    private BigDecimal precioPromedio;
    private BigDecimal descuentoMaximo;

    private Integer tiempoEntregaDias;
}