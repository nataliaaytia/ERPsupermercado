
package com.sonic.erp.ordenesdecompra.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegistrarRespuestaProveedorRequest(

        @NotBlank(message = "Debe indicar la respuesta del proveedor")
        @Pattern(
                regexp = "ACEPTADA|RECHAZADA",
                message = "La respuesta debe ser ACEPTADA o RECHAZADA"
        )
        String respuesta,

        @NotBlank(message = "Debe indicar la referencia de la respuesta")
        @Size(
                max = 150,
                message = "La referencia no puede superar 150 caracteres"
        )
        String referencia,

        @NotBlank(message = "Debe indicar el origen de la respuesta")
        @Pattern(
                regexp = "CORREO|WHATSAPP|TELEFONO|OTRO",
                message = "El origen no es valido"
        )
        String origen,

        @Size(
                max = 500,
                message = "La observacion no puede superar 500 caracteres"
        )
        String observacion

) {
}
