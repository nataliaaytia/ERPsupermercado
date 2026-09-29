package com.sonic.erp.proveedores.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProveedorUpdateRequest {

    @Size(max = 30, message = "El NIT o RUC no debe superar los 30 caracteres")
    @Pattern(regexp = "^[0-9]+$", message = "El NIT o RUC solo debe contener numeros")
    private String nitRuc;

    @Size(max = 150, message = "La razón social no puede superar los 150 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ.\\s]+$", message = "La razon social solo debe contener letras, puntos y espacios")
    private String razonSocial;

    @Size(max = 150, message = "La direccion no puede superar los 150 caracteres")
    private String direccion;

    @Size(min = 7, max = 15, message = "El telefono debe tener entre 7 y 15 dígitos")
    @Pattern(regexp = "^[0-9]+$", message = "El telefono solo debe contener numeros")
    private String telefono;

    @Email(message = "El correo electronico debe tener un formato valido (ejemplo@gmail.com)")
    @Size(max = 100, message = "El correo no puede superar los 100 caracteres")
    private String correo;

    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$", message = "El estado solo debe contener letras")
    @Size(max = 30, message = "El estado no puede superar los 30 caracteres")
    private String estado;
}