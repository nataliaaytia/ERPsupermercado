package com.sonic.erp.proveedores.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "inspecciones_mercaderia")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InspeccionMercaderia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_inspeccion")
    private Long idInspeccion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_proveedor", nullable = false)
    private Proveedor proveedor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Column(name = "cantidad_inspeccionada", nullable = false)
    private Integer cantidadInspeccionada;

    @Column(name = "cantidad_aceptada", nullable = false)
    private Integer cantidadAceptada;

    @Column(name = "fecha_inspeccion", nullable = false)
    private LocalDateTime fechaInspeccion;

    @PrePersist
    public void alCrear() {
        if (this.fechaInspeccion == null) {
            this.fechaInspeccion = LocalDateTime.now();
        }
    }
}