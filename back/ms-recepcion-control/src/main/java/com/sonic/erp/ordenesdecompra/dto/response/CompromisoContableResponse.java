package com.sonic.erp.ordenesdecompra.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompromisoContableResponse {

    private Long idCompromiso;
    private Long idOrden;
    private String numeroOrden;
    private BigDecimal montoTotal;
    private String estadoEnvio;
    private String messageIdPubsub;
    private String mensaje;
    private LocalDateTime fechaRegistro;

    public Long getIdCompromiso() { return idCompromiso; }
    public void setIdCompromiso(Long idCompromiso) { this.idCompromiso = idCompromiso; }

    public Long getIdOrden() { return idOrden; }
    public void setIdOrden(Long idOrden) { this.idOrden = idOrden; }

    public String getNumeroOrden() { return numeroOrden; }
    public void setNumeroOrden(String numeroOrden) { this.numeroOrden = numeroOrden; }

    public BigDecimal getMontoTotal() { return montoTotal; }
    public void setMontoTotal(BigDecimal montoTotal) { this.montoTotal = montoTotal; }

    public String getEstadoEnvio() { return estadoEnvio; }
    public void setEstadoEnvio(String estadoEnvio) { this.estadoEnvio = estadoEnvio; }

    public String getMessageIdPubsub() { return messageIdPubsub; }
    public void setMessageIdPubsub(String messageIdPubsub) { this.messageIdPubsub = messageIdPubsub; }

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }

    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }
}