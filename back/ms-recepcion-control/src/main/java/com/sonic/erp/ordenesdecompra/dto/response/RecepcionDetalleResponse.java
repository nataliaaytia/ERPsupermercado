package com.sonic.erp.ordenesdecompra.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record RecepcionDetalleResponse(
        Long idRecepcion,
        Long idOrden,
        String numeroOrden,
        Long proveedorId,
        LocalDate fecha,
        String documento,
        String almacen,
        String estado,
        String observacion,
        BigDecimal costoTransporte,
        String conceptoTransporte,
        String comprobanteTransporte,
        List<LineaResponse> detalles
) {
    public record LineaResponse(
            Long idDetalle,
            Long productoId,
            Integer cantidadRecibida,
            Integer cantidadAceptada,
            String observacion
    ) {
    }
}