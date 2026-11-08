package com.sonic.erp.ordenesdecompra.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrarDiscrepanciaRequest {

    @NotNull(message = "El ID del detalle de recepción es obligatorio")
    private Long idDetalle;

    @NotBlank(message = "El tipo de diferencia es obligatorio (FALTANTE, EXCESO, PRODUCTO_INCORRECTO, DIFERENCIA_CALIDAD)")
    private String tipoDiferencia;

    @NotNull(message = "La cantidad en discrepancia es obligatoria")
    @Min(value = 1, message = "La cantidad en discrepancia debe ser mayor a 0")
    private Integer cantidad;

    @NotBlank(message = "La descripción o motivo de la discrepancia es obligatoria")
    private String motivo;

    public Long getIdDetalle() { return idDetalle; }
    public void setIdDetalle(Long idDetalle) { this.idDetalle = idDetalle; }

    public String getTipoDiferencia() { return tipoDiferencia; }
    public void setTipoDiferencia(String tipoDiferencia) { this.tipoDiferencia = tipoDiferencia; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
}