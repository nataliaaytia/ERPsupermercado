package com.sonic.erp.proveedores.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CatalogoCategoriaResponse {

    private Long idCatalogo;
    private Long idProducto;
    private String codigoSku;
    private String descripcion;
    private String categoria;
    private String unidad;
    private BigDecimal precio;
}