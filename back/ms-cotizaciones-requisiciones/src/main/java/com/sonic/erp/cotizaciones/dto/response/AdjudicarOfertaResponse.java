package com.sonic.erp.cotizaciones.dto.response;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdjudicarOfertaResponse {

    private String mensaje;
    private Long idOfertaGanadora;
    private Long proveedorId;
    private Long idSolicitud;
    private String estadoOferta;
    private String estadoSolicitud;
    private LocalDate fechaAdjudicacion;
}