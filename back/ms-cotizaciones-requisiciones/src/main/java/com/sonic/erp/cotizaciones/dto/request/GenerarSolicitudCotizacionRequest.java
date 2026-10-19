
package com.sonic.erp.cotizaciones.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record GenerarSolicitudCotizacionRequest(

        @NotNull(message = "La requisición es obligatoria")
        Long idRequisicion,

        @NotNull(message = "La fecha límite es obligatoria")
        LocalDate fechaLimite

) {
}
