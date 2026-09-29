package com.sonic.erp.proveedores.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IncidenciaCreateRequest {

    @NotNull(message = "El ID del proveedor es obligatorio")
    private Long idProveedor;

    @NotBlank(message = "El tipo de incidencia es obligatorio")
    @Size(max = 30, message = "El tipo no debe exceder 30 caracteres")
    private String tipo;

    @NotBlank(message = "La descripcion es obligatoria")
    @Size(max = 200, message = "La descripcion no debe exceder 200 caracteres")
    private String descripcion;
}