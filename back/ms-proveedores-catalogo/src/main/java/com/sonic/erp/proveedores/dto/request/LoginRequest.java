package com.sonic.erp.proveedores.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {

    @NotBlank(message = "El username es obligatorio")
    @Size(
            min = 3,
            max = 50,
            message = "El username debe tener entre 3 y 50 caracteres"
    )
    @Pattern(
            regexp = "^[a-zA-Z0-9_]+$",
            message = "El username contiene caracteres no permitidos"
    )
    private String username;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(
            min = 8,
            max = 100,
            message = "La contraseña debe tener entre 8 y 100 caracteres"
    )
    private String password;
}