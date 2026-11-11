package com.sonic.erp.ordenesdecompra.dto.response;

public record CondicionesLogisticasResponse(
        Long idOrden,
        String numero,
        String destinoEntrega,
        String horarioEntrega,
        String responsableEntrega
) {
}