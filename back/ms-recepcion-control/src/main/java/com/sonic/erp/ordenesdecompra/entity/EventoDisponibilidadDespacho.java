package com.sonic.erp.ordenesdecompra.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "evento_disponibilidad_despacho")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventoDisponibilidadDespacho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evento_disponibilidad")
    private Long idEventoDisponibilidad;

    @Column(name = "id_recepcion", nullable = false)
    private Long idRecepcion;

    @Column(name = "nombre_evento", nullable = false, length = 50)
    private String nombreEvento; // MercaderiaDisponible

    @Column(name = "total_unidades_disponibles", nullable = false)
    private Integer totalUnidadesDisponibles;

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

    public Long getIdEventoDisponibilidad() { return idEventoDisponibilidad; }
    public void setIdEventoDisponibilidad(Long idEventoDisponibilidad) { this.idEventoDisponibilidad = idEventoDisponibilidad; }

    public Long getIdRecepcion() { return idRecepcion; }
    public void setIdRecepcion(Long idRecepcion) { this.idRecepcion = idRecepcion; }

    public String getNombreEvento() { return nombreEvento; }
    public void setNombreEvento(String nombreEvento) { this.nombreEvento = nombreEvento; }

    public Integer getTotalUnidadesDisponibles() { return totalUnidadesDisponibles; }
    public void setTotalUnidadesDisponibles(Integer totalUnidadesDisponibles) { this.totalUnidadesDisponibles = totalUnidadesDisponibles; }

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