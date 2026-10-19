
package com.sonic.erp.cotizaciones.dto.response;

import java.time.LocalDate;

public record SolicitudCotizacionResponse(
        Long idSolicitud,
        Long idRequisicion,
        LocalDate fecha,
        LocalDate fechaLimite,
        String estado
) {
}
