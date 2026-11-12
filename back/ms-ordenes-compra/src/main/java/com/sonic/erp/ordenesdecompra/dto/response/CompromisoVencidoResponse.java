package com.sonic.erp.ordenesdecompra.dto.response;

import java.time.LocalDate;

public record CompromisoVencidoResponse(
        Long idCompromiso,
        Long idOrden,
        String numeroOrden,
        Long proveedorId,
        Long idDetalle,
        Long productoId,
        LocalDate fechaComprometida,
        Integer cantidadPendiente
) {
}