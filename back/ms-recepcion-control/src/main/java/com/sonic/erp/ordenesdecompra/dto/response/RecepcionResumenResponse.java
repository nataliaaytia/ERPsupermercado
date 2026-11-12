package com.sonic.erp.ordenesdecompra.dto.response;

import java.time.LocalDate;

public record RecepcionResumenResponse(
        Long idRecepcion,
        Long idOrden,
        String numeroOrden,
        Long proveedorId,
        LocalDate fecha,
        String documento,
        String almacen,
        String estado
) {
}