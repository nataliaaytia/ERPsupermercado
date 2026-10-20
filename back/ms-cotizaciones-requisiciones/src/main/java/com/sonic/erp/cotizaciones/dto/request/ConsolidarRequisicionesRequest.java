package com.sonic.erp.cotizaciones.dto.request;

import java.time.LocalDate;
import java.util.List;

public record ConsolidarRequisicionesRequest(
        List<Long> idsRequisiciones,
        LocalDate fechaLimite
) {
}