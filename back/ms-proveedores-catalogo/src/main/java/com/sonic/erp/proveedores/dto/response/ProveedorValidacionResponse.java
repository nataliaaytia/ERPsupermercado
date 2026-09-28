package com.sonic.erp.proveedores.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class ProveedorValidacionResponse {

    private Long idProveedor;
    private boolean valido;
    private String mensaje;
    private List<String> errores;
}