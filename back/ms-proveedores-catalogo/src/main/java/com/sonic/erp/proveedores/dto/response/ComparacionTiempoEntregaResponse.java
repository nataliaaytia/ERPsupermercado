package com.sonic.erp.proveedores.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComparacionTiempoEntregaResponse {

    private Long idProducto;
    private String codigoSku;
    private String descripcion;
    private List<ProveedorTiempoEntregaDTO> proveedores;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProveedorTiempoEntregaDTO {

        private Long idProveedor;
        private String razonSocial;
        private Integer tiempoEntregaDias;
    }
}