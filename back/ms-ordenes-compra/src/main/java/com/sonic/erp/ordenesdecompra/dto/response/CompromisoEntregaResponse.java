package com.sonic.erp.ordenesdecompra.dto.response;

import java.time.LocalDate;

public record CompromisoEntregaResponse(
        Long idCompromiso,
        Long idOrden,
        Long idDetalle,
        Long productoId,
        LocalDate fechaEntrega,
        Integer cantidad,
        String estado,
        String observacion
) {
}