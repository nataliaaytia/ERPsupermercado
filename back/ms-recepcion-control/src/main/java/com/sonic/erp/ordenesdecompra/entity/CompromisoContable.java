package com.sonic.erp.ordenesdecompra.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "compromiso_contable")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompromisoContable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_compromiso")
    private Long idCompromiso;

    @Column(name = "id_orden", nullable = false)
    private Long idOrden;

    @Column(name = "numero_orden", nullable = false, length = 50)
    private String numeroOrden;

    @Column(name = "proveedor_id", nullable = false)
    private Long proveedorId;

    @Column(name = "monto_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal montoTotal;

    @Column(name = "estado_envio", nullable = false, length = 30)
    private String estadoEnvio; // ENVIADO, FALLIDO, PENDIENTE

    @Column(name = "message_id_pubsub", length = 100)
    private String messageIdPubsub;

    @Column(name = "error_detalle", length = 1000)
    private String errorDetalle;

    @Column(name = "fecha_evento", nullable = false)
    private LocalDateTime fechaEvento;

    @Column(name = "fecha_envio")
    private LocalDateTime fechaEnvio;

    public Long getIdCompromiso() { return idCompromiso; }
    public void setIdCompromiso(Long idCompromiso) { this.idCompromiso = idCompromiso; }

    public Long getIdOrden() { return idOrden; }
    public void setIdOrden(Long idOrden) { this.idOrden = idOrden; }

    public String getNumeroOrden() { return numeroOrden; }
    public void setNumeroOrden(String numeroOrden) { this.numeroOrden = numeroOrden; }

    public Long getProveedorId() { return proveedorId; }
    public void setProveedorId(Long proveedorId) { this.proveedorId = proveedorId; }

    public BigDecimal getMontoTotal() { return montoTotal; }
    public void setMontoTotal(BigDecimal montoTotal) { this.montoTotal = montoTotal; }

    public String getEstadoEnvio() { return estadoEnvio; }
    public void setEstadoEnvio(String estadoEnvio) { this.estadoEnvio = estadoEnvio; }

    public String getMessageIdPubsub() { return messageIdPubsub; }
    public void setMessageIdPubsub(String messageIdPubsub) { this.messageIdPubsub = messageIdPubsub; }

    public String getErrorDetalle() { return errorDetalle; }
    public void setErrorDetalle(String errorDetalle) { this.errorDetalle = errorDetalle; }

    public LocalDateTime getFechaEvento() { return fechaEvento; }
    public void setFechaEvento(LocalDateTime fechaEvento) { this.fechaEvento = fechaEvento; }

    public LocalDateTime getFechaEnvio() { return fechaEnvio; }
    public void setFechaEnvio(LocalDateTime fechaEnvio) { this.fechaEnvio = fechaEnvio; }
}