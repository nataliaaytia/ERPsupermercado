package com.sonic.erp.ordenesdecompra.dto.response;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResolucionDevolucionResponse {

    private Long idDevolucion;
    private Long idDetalle;
    private String estadoAnterior;
    private String nuevoEstado;
    private String tipoResolucion;
    private String evidencia;
    private String mensaje;
    private LocalDate fechaResolucion;

    public Long getIdDevolucion() { return idDevolucion; }
    public void setIdDevolucion(Long idDevolucion) { this.idDevolucion = idDevolucion; }

    public Long getIdDetalle() { return idDetalle; }
    public void setIdDetalle(Long idDetalle) { this.idDetalle = idDetalle; }

    public String getEstadoAnterior() { return estadoAnterior; }
    public void setEstadoAnterior(String estadoAnterior) { this.estadoAnterior = estadoAnterior; }

    public String getNuevoEstado() { return nuevoEstado; }
    public void setNuevoEstado(String nuevoEstado) { this.nuevoEstado = nuevoEstado; }

    public String getTipoResolucion() { return tipoResolucion; }
    public void setTipoResolucion(String tipoResolucion) { this.tipoResolucion = tipoResolucion; }

    public String getEvidencia() { return evidencia; }
    public void setEvidencia(String evidencia) { this.evidencia = evidencia; }

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }

    public LocalDate getFechaResolucion() { return fechaResolucion; }
    public void setFechaResolucion(LocalDate fechaResolucion) { this.fechaResolucion = fechaResolucion; }
}