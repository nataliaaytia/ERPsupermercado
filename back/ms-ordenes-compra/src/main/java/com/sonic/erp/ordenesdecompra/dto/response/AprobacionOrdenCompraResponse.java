
package com.sonic.erp.ordenesdecompra.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AprobacionOrdenCompraResponse(
        Long idOrden,
        String numero,
        String estado,
        String aprobadoPor,
        LocalDateTime fechaAprobacion,
        BigDecimal total
) {
}
