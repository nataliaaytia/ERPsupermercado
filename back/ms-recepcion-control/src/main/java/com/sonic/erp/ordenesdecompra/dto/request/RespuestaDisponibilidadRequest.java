package com.sonic.erp.ordenesdecompra.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RespuestaDisponibilidadRequest {

    @NotNull(message = "El recepcionId es obligatorio")
    private Long recepcionId;

    @NotBlank(message = "El correlationId es obligatorio")
    private String correlationId;

    @NotBlank(message = "El estado del resultado es obligatorio (CONFIRMADO o RECHAZADO)")
    private String estado;

    private String codigoPlanificacion;
    private String motivoRechazo;
    private String fechaRespuesta;

    public Long getRecepcionId() { return recepcionId; }
    public void setRecepcionId(Long recepcionId) { this.recepcionId = recepcionId; }

    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getCodigoPlanificacion() { return codigoPlanificacion; }
    public void setCodigoPlanificacion(String codigoPlanificacion) { this.codigoPlanificacion = codigoPlanificacion; }

    public String getMotivoRechazo() { return motivoRechazo; }
    public void setMotivoRechazo(String motivoRechazo) { this.motivoRechazo = motivoRechazo; }

    public String getFechaRespuesta() { return fechaRespuesta; }
    public void setFechaRespuesta(String fechaRespuesta) { this.fechaRespuesta = fechaRespuesta; }
}