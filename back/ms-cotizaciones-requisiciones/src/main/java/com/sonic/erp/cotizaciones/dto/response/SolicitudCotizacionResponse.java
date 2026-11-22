
package com.sonic.erp.cotizaciones.dto.response;

import java.time.LocalDate;
import java.util.List;

public record SolicitudCotizacionResponse(
        Long idSolicitud,
        Long idRequisicion,
        LocalDate fecha,
        LocalDate fechaLimite,
        String estado,
        // Datos de la consolidación (null si la solicitud viene de una sola requisición)
        Long idConsolidacion,
        List<Long> idsRequisicionesConsolidadas,
        List<ProductoConsolidado> productosConsolidados
) {
    public record ProductoConsolidado(Long productoId, Integer cantidad) {
    }
}
