package com.sonic.erp.ordenesdecompra.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResolverDevolucionRequest {

    @NotNull(message = "El ID de la devolución es obligatorio")
    private Long idDevolucion;

    @NotBlank(message = "El tipo de resolución es obligatorio (RETIRO o COMPROMISO_REPOSICION)")
    private String tipoResolucion;

    @NotBlank(message = "El documento o evidencia de respaldo es obligatorio")
    private String evidencia;

    private String observacion;

    public Long getIdDevolucion() { return idDevolucion; }
    public void setIdDevolucion(Long idDevolucion) { this.idDevolucion = idDevolucion; }

    public String getTipoResolucion() { return tipoResolucion; }
    public void setTipoResolucion(String tipoResolucion) { this.tipoResolucion = tipoResolucion; }

    public String getEvidencia() { return evidencia; }
    public void setEvidencia(String evidencia) { this.evidencia = evidencia; }

    public String getObservacion() { return observacion; }
    public void setObservacion(String observacion) { this.observacion = observacion; }
}