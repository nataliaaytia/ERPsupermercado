package com.sonic.erp.proveedores.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;


@Entity
@Table (name = "incidencias_proveedores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class IncidenciaProveedor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column (name = "id_incidencia")
    private Long idIncidencia;

    @Column (name = "fecha", nullable = false)
    private LocalDateTime fecha;

    @Column(name = "tipo", nullable = false, length = 30)
    private String tipo;

    @Column(name = "descripcion", nullable = false, length = 200)
    private String descripcion;


    @ManyToOne (fetch = FetchType.LAZY)
    @JoinColumn(name = "id_proveedor", nullable = false)
    private Proveedor proveedor;
}
