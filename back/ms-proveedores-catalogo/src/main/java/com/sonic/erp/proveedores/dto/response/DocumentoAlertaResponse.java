package com.sonic.erp.proveedores.dto.response;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentoAlertaResponse {

    private Long idDocumento;
    private String tipoDocumento;
    private String numeroDocumento;
    private LocalDate fechaVencimiento;
    private Long idProveedor;
    private String razonSocial;
    private String mensaje;
}