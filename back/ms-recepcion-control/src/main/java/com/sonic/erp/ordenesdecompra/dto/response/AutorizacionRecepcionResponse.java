package com.sonic.erp.ordenesdecompra.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AutorizacionRecepcionResponse {

    private Long idRecepcion;
    private String estadoRecepcion;
    private boolean yaEstabaAutorizada;
    private LocalDateTime fechaAutorizacion;
    private Integer totalUnidadesAutorizadas;
    private Integer totalUnidadesExcluidas;
    private String mensaje;
    private List<LineaAutorizadaResponse> lineasAutorizadas;

    public Long getIdRecepcion() { return idRecepcion; }
    public void setIdRecepcion(Long idRecepcion) { this.idRecepcion = idRecepcion; }

    public String getEstadoRecepcion() { return estadoRecepcion; }
    public void setEstadoRecepcion(String estadoRecepcion) { this.estadoRecepcion = estadoRecepcion; }

    public boolean isYaEstabaAutorizada() { return yaEstabaAutorizada; }
    public void setYaEstabaAutorizada(boolean yaEstabaAutorizada) { this.yaEstabaAutorizada = yaEstabaAutorizada; }

    public LocalDateTime getFechaAutorizacion() { return fechaAutorizacion; }
    public void setFechaAutorizacion(LocalDateTime fechaAutorizacion) { this.fechaAutorizacion = fechaAutorizacion; }

    public Integer getTotalUnidadesAutorizadas() { return totalUnidadesAutorizadas; }
    public void setTotalUnidadesAutorizadas(Integer totalUnidadesAutorizadas) { this.totalUnidadesAutorizadas = totalUnidadesAutorizadas; }

    public Integer getTotalUnidadesExcluidas() { return totalUnidadesExcluidas; }
    public void setTotalUnidadesExcluidas(Integer totalUnidadesExcluidas) { this.totalUnidadesExcluidas = totalUnidadesExcluidas; }

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }

    public List<LineaAutorizadaResponse> getLineasAutorizadas() { return lineasAutorizadas; }
    public void setLineasAutorizadas(List<LineaAutorizadaResponse> lineasAutorizadas) { this.lineasAutorizadas = lineasAutorizadas; }
}