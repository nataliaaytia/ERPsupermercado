package com.sonic.erp.proveedores.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComparacionPrecioResponse {

    private Long idProducto;
    private String codigoSku;
    private String descripcion;
    private List<ProveedorPrecioDTO> proveedores;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProveedorPrecioDTO {

        private Long idProveedor;
        private String razonSocial;
        private BigDecimal precio;
    }
}