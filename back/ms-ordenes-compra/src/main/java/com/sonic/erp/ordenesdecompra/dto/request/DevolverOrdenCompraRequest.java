
package com.sonic.erp.ordenesdecompra.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DevolverOrdenCompraRequest(

        @NotBlank(message = "Debe indicar el motivo de la devolucion")
        @Size(
                max = 500,
                message = "El motivo no puede superar 500 caracteres"
        )
        String motivo

) {
}
