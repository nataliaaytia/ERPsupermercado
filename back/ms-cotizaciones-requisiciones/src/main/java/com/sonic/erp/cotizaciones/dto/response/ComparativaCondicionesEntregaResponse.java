package com.sonic.erp.cotizaciones.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComparativaCondicionesEntregaResponse {

    private Long idSolicitud;
    private Long idRequisicion;
    private int totalOfertas;
    private Long proveedorMasRapidoId;
    private Integer menorPlazoGlobalDias;
    private List<CondicionOfertaDTO> ofertas;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CondicionOfertaDTO {
        private Long idOferta;
        private Long proveedorId;
        private LocalDate fechaOferta;
        private LocalDate validezOferta;
        private String estado;
        private Integer plazoMinimoDias;
        private Integer plazoMaximoDias;
        private LocalDate fechaEstimadaEntregaMaxima;
        private List<DetallePlazoDTO> plazosPorProducto;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DetallePlazoDTO {
        private Long idDetalle;
        private Long productoId;
        private Integer cantidad;
        private Integer plazoEntregaDias;
        private LocalDate fechaEstimadaEntrega;
    }
}