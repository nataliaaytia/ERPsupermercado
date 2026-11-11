package com.sonic.erp.ordenesdecompra.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeguimientoRespuestaContableResponse {

    private boolean procesado;
    private Long idCompromiso;
    private Long idOrden;
    private String eventId;
    private String estadoPrevio;
    private String estadoFinal;
    private String resultadoContabilidad;
    private String numeroComprobante;
    private String detalle;
    private LocalDateTime fechaProcesamiento;

    public boolean isProcesado() { return procesado; }
    public void setProcesado(boolean procesado) { this.procesado = procesado; }

    public Long getIdCompromiso() { return idCompromiso; }
    public void setIdCompromiso(Long idCompromiso) { this.idCompromiso = idCompromiso; }

    public Long getIdOrden() { return idOrden; }
    public void setIdOrden(Long idOrden) { this.idOrden = idOrden; }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getEstadoPrevio() { return estadoPrevio; }
    public void setEstadoPrevio(String estadoPrevio) { this.estadoPrevio = estadoPrevio; }

    public String getEstadoFinal() { return estadoFinal; }
    public void setEstadoFinal(String estadoFinal) { this.estadoFinal = estadoFinal; }

    public String getResultadoContabilidad() { return resultadoContabilidad; }
    public void setResultadoContabilidad(String resultadoContabilidad) { this.resultadoContabilidad = resultadoContabilidad; }

    public String getNumeroComprobante() { return numeroComprobante; }
    public void setNumeroComprobante(String numeroComprobante) { this.numeroComprobante = numeroComprobante; }

    public String getDetalle() { return detalle; }
    public void setDetalle(String detalle) { this.detalle = detalle; }

    public LocalDateTime getFechaProcesamiento() { return fechaProcesamiento; }
    public void setFechaProcesamiento(LocalDateTime fechaProcesamiento) { this.fechaProcesamiento = fechaProcesamiento; }
}