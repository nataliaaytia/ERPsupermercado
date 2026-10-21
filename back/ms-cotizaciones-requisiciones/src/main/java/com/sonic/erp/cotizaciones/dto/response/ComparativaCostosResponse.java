package com.sonic.erp.cotizaciones.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComparativaCostosResponse {

    private Long idSolicitud;
    private Long idRequisicion;
    private int totalPropuestasValidas;
    private Long ofertaMasEconomicaId;
    private BigDecimal menorCostoTotal;
    private Long ofertaMasCostosaId;
    private BigDecimal mayorCostoTotal;
    private BigDecimal costoPromedio;
    private List<CostoOfertaDTO> propuestas;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CostoOfertaDTO {
        private Long idOferta;
        private Long proveedorId;
        private LocalDate fecha;
        private LocalDate validez;
        private String estado;
        private BigDecimal costoTotal;
        private BigDecimal diferenciaConMenorCosto;
        private Double porcentajeVariacion;
        private int totalItemsCotizados;
        private List<CostoDetalleDTO> desgloseItems;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CostoDetalleDTO {
        private Long idDetalle;
        private Long productoId;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal subtotal;
    }
}