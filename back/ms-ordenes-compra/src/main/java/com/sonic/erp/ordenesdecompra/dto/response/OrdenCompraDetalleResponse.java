
package com.sonic.erp.ordenesdecompra.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record OrdenCompraDetalleResponse(
        Long idOrden,
        String numero,
        Long idOferta,
        Long proveedorId,
        LocalDate fecha,
        String estado,
        BigDecimal total,
        String observacion,
        List<DetalleResponse> detalles
) {

    public record DetalleResponse(
            Long idDetalle,
            Long productoId,
            Integer cantidad,
            BigDecimal precio,
            BigDecimal subtotal
    ) {
    }
}
