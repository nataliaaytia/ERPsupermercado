package com.sonic.erp.proveedores.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductosDefectuososResponse {

    private Long idProveedor;
    private String razonSocial;
    private Integer totalProductosInspeccionados;
    private Integer totalProductosAceptados;
    private Integer totalProductosDefectuosos;
    private Double porcentajeDefectuosos;
    private List<DetalleProductoDefectuosoDTO> detalleProductos;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DetalleProductoDefectuosoDTO {
        private Long idProducto;
        private String descripcion;
        private Integer cantidadInspeccionada;
        private Integer cantidadAceptada;
        private Integer cantidadDefectuosa;
    }
}