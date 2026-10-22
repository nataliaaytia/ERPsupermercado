package com.sonic.erp.cotizaciones.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertaInventario {
    private String idAlerta;
    private Long productoId;
    private Integer cantidadSugerida;
    private String motivo;
    private String prioridad;
}