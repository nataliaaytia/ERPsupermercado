package com.sonic.erp.cotizaciones.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "consolidaciones_requisiciones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsolidacionRequisiciones {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idConsolidacion;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false, length = 30)
    private String estado;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "requisiciones_consolidadas",
            joinColumns = @JoinColumn(name = "id_consolidacion"),
            inverseJoinColumns = @JoinColumn(name = "id_requisicion")
    )
    @Builder.Default
    private List<Requisicion> requisiciones = new ArrayList<>();

    @OneToMany(
            mappedBy = "consolidacion",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<DetalleConsolidacion> detalles = new ArrayList<>();
}