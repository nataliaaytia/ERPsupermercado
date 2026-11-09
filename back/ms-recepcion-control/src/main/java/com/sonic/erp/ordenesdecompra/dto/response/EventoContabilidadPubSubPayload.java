package com.sonic.erp.ordenesdecompra.dto.response;

import com.sonic.erp.ordenesdecompra.dto.request.DetalleCompromisoRequest;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventoContabilidadPubSubPayload {

    private String evento;
    private Long idOrden;
    private String numeroOrden;
    private Long proveedorId;
    private BigDecimal montoTotal;
    private String moneda;
    private String fechaConfirmacion;
    private List<DetalleCompromisoRequest> detalles;

    public String getEvento() { return evento; }
    public void setEvento(String evento) { this.evento = evento; }

    public Long getIdOrden() { return idOrden; }
    public void setIdOrden(Long idOrden) { this.idOrden = idOrden; }

    public String getNumeroOrden() { return numeroOrden; }
    public void setNumeroOrden(String numeroOrden) { this.numeroOrden = numeroOrden; }

    public Long getProveedorId() { return proveedorId; }
    public void setProveedorId(Long proveedorId) { this.proveedorId = proveedorId; }

    public BigDecimal getMontoTotal() { return montoTotal; }
    public void setMontoTotal(BigDecimal montoTotal) { this.montoTotal = montoTotal; }

    public String getMoneda() { return moneda; }
    public void setMoneda(String moneda) { this.moneda = moneda; }

    public String getFechaConfirmacion() { return fechaConfirmacion; }
    public void setFechaConfirmacion(String fechaConfirmacion) { this.fechaConfirmacion = fechaConfirmacion; }

    public List<DetalleCompromisoRequest> getDetalles() { return detalles; }
    public void setDetalles(List<DetalleCompromisoRequest> detalles) { this.detalles = detalles; }
}