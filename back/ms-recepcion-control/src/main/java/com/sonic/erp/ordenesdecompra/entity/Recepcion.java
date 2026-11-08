package com.sonic.erp.ordenesdecompra.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "recepcion")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recepcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_recepcion")
    private Long idRecepcion;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "almacen", nullable = false, length = 100)
    private String almacen;

    @Column(name = "estado", nullable = false, length = 30)
    private String estado;

    @Column(name = "observacion", length = 500)
    private String observacion;

    @OneToMany(mappedBy = "recepcion", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DetalleRecepcion> detalles = new ArrayList<>();

    public void agregarDetalle(DetalleRecepcion detalle) {
        detalles.add(detalle);
        detalle.setRecepcion(this);
    }

    public void removeDetalle(DetalleRecepcion detalle) {
        detalles.remove(detalle);
        detalle.setRecepcion(null);
    }

    // Getters y setters explícitos para blindar la compilación
    public Long getIdRecepcion() {
        return idRecepcion;
    }

    public void setIdRecepcion(Long idRecepcion) {
        this.idRecepcion = idRecepcion;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public String getAlmacen() {
        return almacen;
    }

    public void setAlmacen(String almacen) {
        this.almacen = almacen;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getObservacion() {
        return observacion;
    }

    public void setObservacion(String observacion) {
        this.observacion = observacion;
    }

    public List<DetalleRecepcion> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<DetalleRecepcion> detalles) {
        this.detalles = detalles;
    }
}
