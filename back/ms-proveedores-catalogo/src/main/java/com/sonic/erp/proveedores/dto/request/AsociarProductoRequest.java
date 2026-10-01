package com.sonic.erp.proveedores.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AsociarProductoRequest {

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;

    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDate fechaFin;

    @NotBlank(message = "Las condiciones son obligatorias")
    @Size(max = 100, message = "Las condiciones no pueden superar los 100 caracteres")
    private String condiciones;

    @NotBlank(message = "El archivo es obligatorio")
    @Size(max = 100, message = "El archivo no puede superar los 100 caracteres")
    private String archivo;
}