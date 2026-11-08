package com.sonic.erp.ordenesdecompra.dto.response;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConciliacionResponse {

    private Long idRecepcion;
    private Long idOrden;
    private String estadoConciliacion;
    private boolean tieneDiferenciasPendientes;
    private String mensaje;
    private List<LineaConciliacionResponse> lineas;

    public Long getIdRecepcion() { return idRecepcion; }
    public void setIdRecepcion(Long idRecepcion) { this.idRecepcion = idRecepcion; }

    public Long getIdOrden() { return idOrden; }
    public void setIdOrden(Long idOrden) { this.idOrden = idOrden; }

    public String getEstadoConciliacion() { return estadoConciliacion; }
    public void setEstadoConciliacion(String estadoConciliacion) { this.estadoConciliacion = estadoConciliacion; }

    public boolean isTieneDiferenciasPendientes() { return tieneDiferenciasPendientes; }
    public void setTieneDiferenciasPendientes(boolean tieneDiferenciasPendientes) { this.tieneDiferenciasPendientes = tieneDiferenciasPendientes; }

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }

    public List<LineaConciliacionResponse> getLineas() { return lineas; }
    public void setLineas(List<LineaConciliacionResponse> lineas) { this.lineas = lineas; }
}