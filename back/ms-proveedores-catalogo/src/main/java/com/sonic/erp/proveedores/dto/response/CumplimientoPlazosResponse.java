package com.sonic.erp.proveedores.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CumplimientoPlazosResponse {

    private Long idProveedor;

    private String razonSocial;

    private Integer totalEntregas;

    private Integer entregasATiempo;

    private Integer entregasRetrasadas;

    private Double porcentajeEntregasATiempo;


    private Integer totalProductosInspeccionados;

    private Integer totalProductosAceptados;

    private Integer totalProductosDefectuosos;

    private Double porcentajeDefectuosos;


}