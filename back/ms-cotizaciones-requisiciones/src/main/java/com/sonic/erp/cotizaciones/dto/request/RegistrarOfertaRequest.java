
package com.sonic.erp.cotizaciones.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;
import java.util.List;

public record RegistrarOfertaRequest(

        @NotNull(message = "El proveedor es obligatorio")
        @Positive(message = "El identificador del proveedor debe ser positivo")
        Long proveedorId,

        @NotNull(message = "La solicitud de cotización es obligatoria")
        @Positive(message = "El identificador de la solicitud debe ser positivo")
        Long idSolicitud,

        @NotNull(message = "La fecha de validez es obligatoria")
        LocalDate validez,

        @NotEmpty(message = "La oferta debe contener al menos un producto")
        List<@NotNull(message = "El detalle es obligatorio")
        @Valid DetalleOfertaRequest> detalles

) {
}
