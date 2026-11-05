package com.sonic.erp.ordenesdecompra.dto.response;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DevolucionResponse {

    private Long idDevolucion;
    private Long idDetalle;
    private Long idRecepcion;
    private Long productoId;
    private Integer cantidadDevuelta;
    private String motivo;
    private String estado;
    private LocalDate fecha;

    public Long getIdDevolucion() { return idDevolucion; }
    public void setIdDevolucion(Long idDevolucion) { this.idDevolucion = idDevolucion; }

    public Long getIdDetalle() { return idDetalle; }
    public void setIdDetalle(Long idDetalle) { this.idDetalle = idDetalle; }

    public Long getIdRecepcion() { return idRecepcion; }
    public void setIdRecepcion(Long idRecepcion) { this.idRecepcion = idRecepcion; }

    public Long getProductoId() { return productoId; }
    public void setProductoId(Long productoId) { this.productoId = productoId; }

    public Integer getCantidadDevuelta() { return cantidadDevuelta; }
    public void setCantidadDevuelta(Integer cantidadDevuelta) { this.cantidadDevuelta = cantidadDevuelta; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
}