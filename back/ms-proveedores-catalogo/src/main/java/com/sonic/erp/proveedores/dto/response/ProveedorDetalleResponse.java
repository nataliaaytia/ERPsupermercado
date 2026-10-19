package com.sonic.erp.proveedores.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class ProveedorDetalleResponse {

    private Long idProveedor;
    private String nitRuc;
    private String razonSocial;
    private String direccion;
    private String telefono;
    private String correo;
    private String estado;
    private Boolean validado;
    private LocalDateTime fechaValidacion;

    private List<ProductoCatalogoDTO> productos;

    @Getter
    @Setter
    @Builder
    public static class ProductoCatalogoDTO {
        private Long idProducto;
        private String codigoSku;
        private String descripcion;
        private String categoria;
        private String unidad;
        private BigDecimal precioReferencial;
        private String estadoProducto;

        // Datos comerciales propios del catálogo
        private String condiciones;
        private LocalDate fechaInicio;
        private LocalDate fechaFin;
    }
}