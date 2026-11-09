
package com.sonic.erp.ordenesdecompra.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AnularOrdenCompraRequest(

        @NotBlank(message = "Debe indicar el motivo de la anulacion")
        @Size(
                max = 500,
                message = "El motivo no puede superar 500 caracteres"
        )
        String motivo

) {
}
