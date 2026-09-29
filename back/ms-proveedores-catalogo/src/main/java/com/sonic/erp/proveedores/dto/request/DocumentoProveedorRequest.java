package com.sonic.erp.proveedores.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class DocumentoProveedorRequest {

    private String tipoDocumento;
    private String numeroDocumento;
    private LocalDate fechaVencimiento;
    private String archivo;
}