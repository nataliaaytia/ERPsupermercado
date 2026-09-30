package com.sonic.erp.proveedores.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CumplimientoEntregasResponse {

    private Long idProveedor;

    private String razonSocial;

    private Integer totalOrdenes;

    private Integer ordenesCompletas;

    private Integer ordenesIncompletas;

    private Double porcentajeEntregasCompletas;
}