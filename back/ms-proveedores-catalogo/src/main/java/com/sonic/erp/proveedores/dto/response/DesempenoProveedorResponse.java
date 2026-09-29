package com.sonic.erp.proveedores.dto.response;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DesempenoProveedorResponse {

    private Long idProveedor;

    private String razonSocial;
    private Double promedioPuntaje;

    private Integer totalEvaluaciones;

    private Integer totalIncidencias;

    private LocalDate fechaUltimaEvaluacion;

    private String comentarioUltimaEvaluacion;

    private String tipoUltimaIncidencia;
}