package com.sonic.erp.ordenesdecompra.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfirmarAutorizacionRequest {

    @NotNull(message = "El ID de la recepción es obligatorio")
    private Long idRecepcion;

    private String usuarioAutorizador;
    private String observacion;

    public Long getIdRecepcion() { return idRecepcion; }
    public void setIdRecepcion(Long idRecepcion) { this.idRecepcion = idRecepcion; }

    public String getUsuarioAutorizador() { return usuarioAutorizador; }
    public void setUsuarioAutorizador(String usuarioAutorizador) { this.usuarioAutorizador = usuarioAutorizador; }

    public String getObservacion() { return observacion; }
    public void setObservacion(String observacion) { this.observacion = observacion; }
}