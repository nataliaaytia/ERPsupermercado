package com.sonic.erp.cotizaciones.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "detalles_consolidacion")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleConsolidacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDetalleConsolidacion;

    @Column(nullable = false)
    private Long productoId;

    @Column(nullable = false)
    private Integer cantidad;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_consolidacion", nullable = false)
    private ConsolidacionRequisiciones consolidacion;
}