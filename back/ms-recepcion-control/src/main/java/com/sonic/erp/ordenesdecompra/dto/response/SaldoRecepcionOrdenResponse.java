package com.sonic.erp.ordenesdecompra.dto.response;

import java.util.List;

public record SaldoRecepcionOrdenResponse(
        Long idOrden,
        List<DetalleSaldoResponse> detalles
) {
    public record DetalleSaldoResponse(
            Long productoId,
            Integer cantidadAceptada,
            Integer cantidadRechazada
    ) {
    }
}