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
public class ComparativaOfertasResponse {

    private Long idSolicitud;
    private Long idRequisicion;
    private int totalOfertas;
    private Long mejorPrecioOfertaId;
    private Long menorPlazoOfertaId;
    private List<OfertaComparacionDTO> ofertas;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OfertaComparacionDTO {
        private Long idOferta;
        private Long proveedorId;
        private LocalDate fecha;
        private LocalDate validez;
        private String estado;
        private BigDecimal totalOferta;
        private Integer plazoEntregaMaximoDias;
        private List<DetalleComparacionDTO> detalles;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DetalleComparacionDTO {
        private Long idDetalle;
        private Long productoId;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal subtotal;
        private Integer plazoEntrega;
    }
}