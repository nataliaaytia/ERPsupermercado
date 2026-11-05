package com.sonic.erp.ordenesdecompra.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LineaAutorizadaResponse {

    private Long idDetalle;
    private Long productoId;
    private Integer cantidadRecibida;
    private Integer cantidadAceptadaAutorizada;
    private Integer cantidadRechazadaExcluida;

    public Long getIdDetalle() { return idDetalle; }
    public void setIdDetalle(Long idDetalle) { this.idDetalle = idDetalle; }

    public Long getProductoId() { return productoId; }
    public void setProductoId(Long productoId) { this.productoId = productoId; }

    public Integer getCantidadRecibida() { return cantidadRecibida; }
    public void setCantidadRecibida(Integer cantidadRecibida) { this.cantidadRecibida = cantidadRecibida; }

    public Integer getCantidadAceptadaAutorizada() { return cantidadAceptadaAutorizada; }
    public void setCantidadAceptadaAutorizada(Integer cantidadAceptadaAutorizada) { this.cantidadAceptadaAutorizada = cantidadAceptadaAutorizada; }

    public Integer getCantidadRechazadaExcluida() { return cantidadRechazadaExcluida; }
    public void setCantidadRechazadaExcluida(Integer cantidadRechazadaExcluida) { this.cantidadRechazadaExcluida = cantidadRechazadaExcluida; }
}