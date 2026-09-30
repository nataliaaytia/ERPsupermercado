package com.sonic.erp.proveedores.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "recepciones_mercaderia")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecepcionMercaderia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_recepcion")
    private Long idRecepcion;

    @Column(name = "numero_orden", nullable = false)
    private String numeroOrden;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_proveedor", nullable = false)
    private Proveedor proveedor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Column(name = "cantidad_solicitada", nullable = false)
    private Integer cantidadSolicitada;

    @Column(name = "cantidad_recibida", nullable = false)
    private Integer cantidadRecibida;

    @Column(name = "fecha_recepcion", nullable = false)
    private LocalDateTime fechaRecepcion;

    @Column(name = "fecha_comprometida", nullable = false)
    private LocalDateTime fechaComprometida;

    @PrePersist
    public void alCrear() {
        if (this.fechaRecepcion == null) {
            this.fechaRecepcion = LocalDateTime.now();
        }
    }
}