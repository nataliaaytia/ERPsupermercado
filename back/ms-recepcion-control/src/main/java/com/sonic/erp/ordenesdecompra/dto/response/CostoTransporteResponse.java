package com.sonic.erp.ordenesdecompra.dto.response;

import java.math.BigDecimal;

public record CostoTransporteResponse(
        Long idRecepcion,
        Long idOrden,
        BigDecimal importe,
        String concepto,
        String comprobante
) {
}