package com.sonic.erp.ordenesdecompra.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LineaConciliacionResponse {

    private Long productoId;
    private Integer cantidadSolicitada;
    private Integer cantidadRecibida;
    private Integer cantidadAceptada;
    private Integer diferencia;
    private String estadoLinea;

    public Long getProductoId() { return productoId; }
    public void setProductoId(Long productoId) { this.productoId = productoId; }

    public Integer getCantidadSolicitada() { return cantidadSolicitada; }
    public void setCantidadSolicitada(Integer cantidadSolicitada) { this.cantidadSolicitada = cantidadSolicitada; }

    public Integer getCantidadRecibida() { return cantidadRecibida; }
    public void setCantidadRecibida(Integer cantidadRecibida) { this.cantidadRecibida = cantidadRecibida; }

    public Integer getCantidadAceptada() { return cantidadAceptada; }
    public void setCantidadAceptada(Integer cantidadAceptada) { this.cantidadAceptada = cantidadAceptada; }

    public Integer getDiferencia() { return diferencia; }
    public void setDiferencia(Integer diferencia) { this.diferencia = diferencia; }

    public String getEstadoLinea() { return estadoLinea; }
    public void setEstadoLinea(String estadoLinea) { this.estadoLinea = estadoLinea; }
}