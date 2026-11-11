package com.sonic.erp.ordenesdecompra.dto.response;

import java.time.LocalDate;
import java.util.List;

public record RecepcionActualizadaResponse(
        Long idRecepcion,
        Long idOrden,
        String estado,
        LocalDate fecha,
        String almacen,
        String observacion,
        List<DetalleResponse> detalles
) {
    public record DetalleResponse(
            Long idDetalle,
            Long productoId,
            Integer cantidadRecibida
    ) {
    }
}