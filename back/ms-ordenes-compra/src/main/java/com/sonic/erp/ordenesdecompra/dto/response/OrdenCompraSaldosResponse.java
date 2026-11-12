package com.sonic.erp.ordenesdecompra.dto.response;

import java.util.List;

public record OrdenCompraSaldosResponse(
        Long idOrden,
        String numero,
        List<DetalleSaldoResponse> detalles
) {
    public record DetalleSaldoResponse(
            Long idDetalle,
            Long productoId,
            Integer cantidadOrdenada,
            Integer cantidadAceptada,
            Integer cantidadPendiente
    ) {
    }
}