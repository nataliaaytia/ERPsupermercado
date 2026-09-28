package com.sonic.erp.proveedores.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProveedorCreateRequest {
    @NotBlank(message = "El NIt o RUC es obligatorio")
    @Size(max =30, message = "El NIT o RUC no debe superar los 30 caracteres")
    private String nitRuc;


    @NotBlank(message = "La razon social es obligatoria")
    @Size(max = 150, message = "La razon social no puede superar los 150 carateres")
    private String razonSocial;

    @NotBlank(message = "La direccion es obligatoria")
    @Size(max = 150, message = "La direccion no puede superar los 150 caracteres")
    private String direccion;

    @NotBlank(message = "El telefono es obligatorio")
    @Size(max = 30, message = "El telefono no puede superar los 30 caracteres")
    private String telefono;


    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo electronico debe tener un formato valido (ejemplo@gmail.com)")
    @Size(max = 100, message = "El correo no puede superar los 100 caracteres")
    private String correo;

}
