package com.sonic.erp.ordenesdecompra.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "detalle_recepcion")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleRecepcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle")
    private Long idDetalle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_recepcion", nullable = false)
    @JsonIgnore
    private Recepcion recepcion;

    @Column(name = "producto_id", nullable = false)
    private Long productoId;

    @Column(name = "cantidad_recibida", nullable = false)
    private Integer cantidadRecibida;

    @Column(name = "cantidad_aceptada", nullable = false)
    private Integer cantidadAceptada;

    @Column(name = "observacion", length = 255)
    private String observacion;

    @OneToMany(mappedBy = "detalleRecepcion", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<InspeccionCalidad> inspecciones = new ArrayList<>();

    @OneToMany(mappedBy = "detalleRecepcion", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Devolucion> devoluciones = new ArrayList<>();

    public void agregarInspeccion(InspeccionCalidad inspeccion) {
        inspecciones.add(inspeccion);
        inspeccion.setDetalleRecepcion(this);
    }

    public void agregarDevolucion(Devolucion devolucion) {
        devoluciones.add(devolucion);
        devolucion.setDetalleRecepcion(this);
    }

    // Getters y setters explícitos
    public Long getIdDetalle() {
        return idDetalle;
    }

    public void setIdDetalle(Long idDetalle) {
        this.idDetalle = idDetalle;
    }

    public Recepcion getRecepcion() {
        return recepcion;
    }

    public void setRecepcion(Recepcion recepcion) {
        this.recepcion = recepcion;
    }

    public Long getProductoId() {
        return productoId;
    }

    public void setProductoId(Long productoId) {
        this.productoId = productoId;
    }

    public Integer getCantidadRecibida() {
        return cantidadRecibida;
    }

    public void setCantidadRecibida(Integer cantidadRecibida) {
        this.cantidadRecibida = cantidadRecibida;
    }

    public Integer getCantidadAceptada() {
        return cantidadAceptada;
    }

    public void setCantidadAceptada(Integer cantidadAceptada) {
        this.cantidadAceptada = cantidadAceptada;
    }

    public String getObservacion() {
        return observacion;
    }

    public void setObservacion(String observacion) {
        this.observacion = observacion;
    }

    public List<InspeccionCalidad> getInspecciones() {
        return inspecciones;
    }

    public void setInspecciones(List<InspeccionCalidad> inspecciones) {
        this.inspecciones = inspecciones;
    }

    public List<Devolucion> getDevoluciones() {
        return devoluciones;
    }

    public void setDevoluciones(List<Devolucion> devoluciones) {
        this.devoluciones = devoluciones;
    }
}