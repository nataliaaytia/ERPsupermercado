package com.sonic.erp.ordenesdecompra.dto.response;

import java.time.LocalDate;
import java.util.List;

public record EntregaParcialResponse(
        Long idRecepcion,
        Long idOrden,
        String documento,
        String estado,
        LocalDate fecha,
        String almacen,
        String observacion,
        List<DetalleResponse> detalles,
        List<SaldoResponse> saldos
) {
    public record DetalleResponse(
            Long idDetalle,
            Long productoId,
            Integer cantidadRecibida
    ) {
    }

    public record SaldoResponse(
            Long productoId,
            Integer cantidadOrdenada,
            Integer cantidadAceptada,
            Integer cantidadEnInspeccion,
            Integer cantidadPendiente
    ) {
    }
}