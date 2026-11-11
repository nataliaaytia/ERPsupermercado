package com.sonic.erp.ordenesdecompra.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisponibilidadDespachoResponse {

    private Long idEventoDisponibilidad;
    private Long idRecepcion;
    private String nombreEvento;
    private Integer totalUnidadesDisponibles;
    private String estadoEnvio;
    private String messageIdPubsub;
    private String mensaje;
    private LocalDateTime fechaRegistro;

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

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }

    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }
}