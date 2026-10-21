
package com.sonic.erp.cotizaciones.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record ActualizarOfertaRequest(

        @NotNull(message = "La fecha de validez es obligatoria")
        LocalDate validez,

        @NotEmpty(message = "La oferta debe contener al menos un producto")
        List<@NotNull @Valid DetalleOfertaRequest> detalles

) {
}
