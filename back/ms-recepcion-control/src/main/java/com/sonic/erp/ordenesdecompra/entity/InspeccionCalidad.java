package com.sonic.erp.ordenesdecompra.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "inspeccion_calidad")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InspeccionCalidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_inspeccion")
    private Long idInspeccion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_detalle", nullable = false)
    @JsonIgnore
    private DetalleRecepcion detalleRecepcion;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "resultado", nullable = false, length = 50)
    private String resultado;

    @Column(name = "observacion", length = 500)
    private String observacion;

    // Getters y setters explícitos
    public Long getIdInspeccion() {
        return idInspeccion;
    }

    public void setIdInspeccion(Long idInspeccion) {
        this.idInspeccion = idInspeccion;
    }

    public DetalleRecepcion getDetalleRecepcion() {
        return detalleRecepcion;
    }

    public void setDetalleRecepcion(DetalleRecepcion detalleRecepcion) {
        this.detalleRecepcion = detalleRecepcion;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public String getResultado() {
        return resultado;
    }

    public void setResultado(String resultado) {
        this.resultado = resultado;
    }

    public String getObservacion() {
        return observacion;
    }

    public void setObservacion(String observacion) {
        this.observacion = observacion;
    }
}
