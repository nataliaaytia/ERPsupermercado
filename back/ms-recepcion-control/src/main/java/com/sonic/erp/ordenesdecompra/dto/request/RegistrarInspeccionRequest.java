package com.sonic.erp.ordenesdecompra.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrarInspeccionRequest {

    @NotNull(message = "El ID del detalle de recepción es obligatorio")
    private Long idDetalle;

    @NotNull(message = "La cantidad conforme es obligatoria")
    @Min(value = 0, message = "La cantidad conforme no puede ser negativa")
    private Integer cantidadConforme;

    @NotNull(message = "La cantidad rechazada es obligatoria")
    @Min(value = 0, message = "La cantidad rechazada no puede ser negativa")
    private Integer cantidadRechazada;

    private String observacion;

    public Long getIdDetalle() { return idDetalle; }
    public void setIdDetalle(Long idDetalle) { this.idDetalle = idDetalle; }

    public Integer getCantidadConforme() { return cantidadConforme; }
    public void setCantidadConforme(Integer cantidadConforme) { this.cantidadConforme = cantidadConforme; }

    public Integer getCantidadRechazada() { return cantidadRechazada; }
    public void setCantidadRechazada(Integer cantidadRechazada) { this.cantidadRechazada = cantidadRechazada; }

    public String getObservacion() { return observacion; }
    public void setObservacion(String observacion) { this.observacion = observacion; }
}