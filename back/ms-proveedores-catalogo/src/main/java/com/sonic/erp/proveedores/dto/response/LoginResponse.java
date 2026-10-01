package com.sonic.erp.proveedores.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private String token;
    private String tipoToken;
    private Long idUsuario;
    private String username;
    private String rol;
    private String mensaje;
}