package com.sonic.erp.proveedores.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class CondicionComercialResponse {
    private Long idCondicion;
    private Long idProveedor;
    private String formaPago;
    private Integer diasCredito;
    private BigDecimal montoMinimoCompra;
    private Integer plazoEntregaDias;
    private String observaciones;
    private LocalDateTime fechaRegistro;
}