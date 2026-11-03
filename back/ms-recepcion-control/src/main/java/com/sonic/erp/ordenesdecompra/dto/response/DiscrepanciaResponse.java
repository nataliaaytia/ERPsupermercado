package com.sonic.erp.ordenesdecompra.dto.response;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscrepanciaResponse {

    private Long idDiscrepancia;
    private Long idDetalle;
    private String tipoDiferencia;
    private Integer cantidad;
    private String motivo;
    private String estado;
    private LocalDate fecha;

    public Long getIdDiscrepancia() { return idDiscrepancia; }
    public void setIdDiscrepancia(Long idDiscrepancia) { this.idDiscrepancia = idDiscrepancia; }

    public Long getIdDetalle() { return idDetalle; }
    public void setIdDetalle(Long idDetalle) { this.idDetalle = idDetalle; }

    public String getTipoDiferencia() { return tipoDiferencia; }
    public void setTipoDiferencia(String tipoDiferencia) { this.tipoDiferencia = tipoDiferencia; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
}