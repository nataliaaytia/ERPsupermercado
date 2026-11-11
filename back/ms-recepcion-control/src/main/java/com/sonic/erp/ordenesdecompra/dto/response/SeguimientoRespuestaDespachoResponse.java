package com.sonic.erp.ordenesdecompra.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeguimientoRespuestaDespachoResponse {

    private boolean procesado;
    private Long idRecepcion;
    private String correlationId;
    private String estadoPrevio;
    private String estadoFinal;
    private String resultadoDespachos;
    private String detalle;
    private LocalDateTime fechaProcesamiento;

    public boolean isProcesado() { return procesado; }
    public void setProcesado(boolean procesado) { this.procesado = procesado; }

    public Long getIdRecepcion() { return idRecepcion; }
    public void setIdRecepcion(Long idRecepcion) { this.idRecepcion = idRecepcion; }

    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }

    public String getEstadoPrevio() { return estadoPrevio; }
    public void setEstadoPrevio(String estadoPrevio) { this.estadoPrevio = estadoPrevio; }

    public String getEstadoFinal() { return estadoFinal; }
    public void setEstadoFinal(String estadoFinal) { this.estadoFinal = estadoFinal; }

    public String getResultadoDespachos() { return resultadoDespachos; }
    public void setResultadoDespachos(String resultadoDespachos) { this.resultadoDespachos = resultadoDespachos; }

    public String getDetalle() { return detalle; }
    public void setDetalle(String detalle) { this.detalle = detalle; }

    public LocalDateTime getFechaProcesamiento() { return fechaProcesamiento; }
    public void setFechaProcesamiento(LocalDateTime fechaProcesamiento) { this.fechaProcesamiento = fechaProcesamiento; }
}