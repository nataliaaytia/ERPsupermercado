package com.sonic.erp.proveedores.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalidadProveedorResponse {

    private Long idProveedor;

    private String razonSocial;

    private Integer totalProductosInspeccionados;

    private Integer totalProductosAceptados;

    private Double porcentajeAceptados;
}