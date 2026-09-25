package com.sonic.erp.proveedores.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
//* siginifica importar todo de la libreria a si no no estamos importando uno por uno

@Entity
@Table (name = "evaluaciones_proveedores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder


public class EvaluacionProveedor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column (name = "id_evaluacion")
    private Long idEvaluacion;

    @Column (name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column (name = "puntaje")
    private Integer puntaje;

    @Column (name = "comentario", nullable = false, length = 300)
    private String comentario;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_proveedor",  nullable = false)
    private Proveedor proveedor;
}
