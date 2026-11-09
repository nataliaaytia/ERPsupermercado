
package com.sonic.erp.ordenesdecompra.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record OrdenCompraResumenResponse(
        Long idOrden,
        String numero,
        Long idOferta,
        Long proveedorId,
        LocalDate fecha,
        String estado,
        BigDecimal total
) {
}
