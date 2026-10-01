package com.sonic.erp.proveedores.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RankingProveedorResponse {
    private Long idProveedor;
    private String nombreProveedor;
    private BigDecimal porcentajeEntregasATiempo;
    private Long cantidadDefectuosos;
    private BigDecimal promedioPrecios;
    private Integer posicionRanking;
}