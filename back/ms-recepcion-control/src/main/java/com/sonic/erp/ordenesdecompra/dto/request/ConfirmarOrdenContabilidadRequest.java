package com.sonic.erp.ordenesdecompra.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfirmarOrdenContabilidadRequest {

    @NotNull(message = "El ID de la orden es obligatorio")
    private Long idOrden;

    @NotBlank(message = "El número de orden es obligatorio")
    private String numeroOrden;

    @NotNull(message = "El ID del proveedor es obligatorio")
    private Long proveedorId;

    @NotBlank(message = "El estado actual de la orden es obligatorio")
    private String estadoOrden;

    @NotNull(message = "El monto total es obligatorio")
    private BigDecimal montoTotal;

    @NotEmpty(message = "Debe incluir al menos un detalle de compra")
    @Valid
    private List<DetalleCompromisoRequest> detalles;

    public Long getIdOrden() { return idOrden; }
    public void setIdOrden(Long idOrden) { this.idOrden = idOrden; }

    public String getNumeroOrden() { return numeroOrden; }
    public void setNumeroOrden(String numeroOrden) { this.numeroOrden = numeroOrden; }

    public Long getProveedorId() { return proveedorId; }
    public void setProveedorId(Long proveedorId) { this.proveedorId = proveedorId; }

    public String getEstadoOrden() { return estadoOrden; }
    public void setEstadoOrden(String estadoOrden) { this.estadoOrden = estadoOrden; }

    public BigDecimal getMontoTotal() { return montoTotal; }
    public void setMontoTotal(BigDecimal montoTotal) { this.montoTotal = montoTotal; }

    public List<DetalleCompromisoRequest> getDetalles() { return detalles; }
    public void setDetalles(List<DetalleCompromisoRequest> detalles) { this.detalles = detalles; }
}