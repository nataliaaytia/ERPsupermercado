package com.sonic.erp.proveedores.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumenComparativoProveedorResponse {

    private Long idProveedor;
    private String razonSocial;

    private BigDecimal precioPromedio;
    private BigDecimal descuentoMaximo;
    private Integer tiempoEntregaDias;
    private Double porcentajeCalidad;
}