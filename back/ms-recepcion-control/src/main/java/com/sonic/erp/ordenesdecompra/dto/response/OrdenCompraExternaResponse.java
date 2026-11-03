package com.sonic.erp.ordenesdecompra.dto.response;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrdenCompraExternaResponse {

    private Long idOrden;
    private String numero;
    private String estado;
    private List<DetalleOrdenExternaResponse> detalles;

    public Long getIdOrden() { return idOrden; }
    public void setIdOrden(Long idOrden) { this.idOrden = idOrden; }

    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public List<DetalleOrdenExternaResponse> getDetalles() { return detalles; }
    public void setDetalles(List<DetalleOrdenExternaResponse> detalles) { this.detalles = detalles; }
}