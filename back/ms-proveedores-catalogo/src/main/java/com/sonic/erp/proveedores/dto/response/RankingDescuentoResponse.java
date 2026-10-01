package com.sonic.erp.proveedores.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RankingDescuentoResponse {

    private Long idProveedor;
    private String razonSocial;

    private Long idProducto;
    private String codigoSku;
    private String descripcionProducto;

    private Integer cantidadMinima;
    private Integer cantidadMaxima;
    private BigDecimal porcentajeDescuento;
}