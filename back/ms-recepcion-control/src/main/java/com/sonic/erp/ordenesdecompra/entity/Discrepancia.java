package com.sonic.erp.ordenesdecompra.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "discrepancia")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Discrepancia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_discrepancia")
    private Long idDiscrepancia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_detalle", nullable = false)
    @JsonIgnore
    private DetalleRecepcion detalleRecepcion;

    @Column(name = "tipo_diferencia", nullable = false, length = 50)
    private String tipoDiferencia;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "motivo", nullable = false, length = 500)
    private String motivo;

    @Column(name = "estado", nullable = false, length = 30)
    private String estado;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    public Long getIdDiscrepancia() { return idDiscrepancia; }
    public void setIdDiscrepancia(Long idDiscrepancia) { this.idDiscrepancia = idDiscrepancia; }

    public DetalleRecepcion getDetalleRecepcion() { return detalleRecepcion; }
    public void setDetalleRecepcion(DetalleRecepcion detalleRecepcion) { this.detalleRecepcion = detalleRecepcion; }

    public String getTipoDiferencia() { return tipoDiferencia; }
    public void setTipoDiferencia(String tipoDiferencia) { this.tipoDiferencia = tipoDiferencia; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
}