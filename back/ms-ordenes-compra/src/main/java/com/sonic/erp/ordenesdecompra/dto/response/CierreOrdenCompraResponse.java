package com.sonic.erp.ordenesdecompra.dto.response;

import java.time.LocalDateTime;

public record CierreOrdenCompraResponse(
        Long idOrden,
        String numero,
        String estado,
        String responsable,
        LocalDateTime fechaCierre
) {
}