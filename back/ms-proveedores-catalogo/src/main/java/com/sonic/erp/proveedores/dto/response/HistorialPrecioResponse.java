package com.sonic.erp.proveedores.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class HistorialPrecioResponse {
    private Long idHistorial;
    private Long idProveedor;
    private String nombreProveedor;
    private Long idProducto;
    private String nombreProducto;
    private BigDecimal precio;
    private LocalDateTime fechaCambio;
    private String motivo;
}