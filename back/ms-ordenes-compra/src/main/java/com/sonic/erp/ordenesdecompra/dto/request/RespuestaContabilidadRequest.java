package com.sonic.erp.ordenesdecompra.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RespuestaContabilidadRequest {

    @NotNull(message = "El idOrden es obligatorio")
    private Long idOrden;

    @NotBlank(message = "El eventId / correlationId es obligatorio")
    private String eventId;

    @NotBlank(message = "El estado del compromiso es obligatorio (REGISTRADO o RECHAZADO)")
    private String estado;

    private String numeroComprobante;
    private BigDecimal montoComprometido;
    private String motivoRechazo;
    private String fechaProcesamientoContable;

    public Long getIdOrden() { return idOrden; }
    public void setIdOrden(Long idOrden) { this.idOrden = idOrden; }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getNumeroComprobante() { return numeroComprobante; }
    public void setNumeroComprobante(String numeroComprobante) { this.numeroComprobante = numeroComprobante; }

    public BigDecimal getMontoComprometido() { return montoComprometido; }
    public void setMontoComprometido(BigDecimal montoComprometido) { this.montoComprometido = montoComprometido; }

    public String getMotivoRechazo() { return motivoRechazo; }
    public void setMotivoRechazo(String motivoRechazo) { this.motivoRechazo = motivoRechazo; }

    public String getFechaProcesamientoContable() { return fechaProcesamientoContable; }
    public void setFechaProcesamientoContable(String fechaProcesamientoContable) { this.fechaProcesamientoContable = fechaProcesamientoContable; }
}