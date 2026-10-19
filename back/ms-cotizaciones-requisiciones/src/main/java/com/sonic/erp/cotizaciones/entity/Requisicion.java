package com.sonic.erp.cotizaciones.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "requisiciones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Requisicion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idRequisicion;

    private LocalDate fecha;

    private String prioridad; // ALTA, MEDIA, BAJA

    private String estado; // PENDIENTE, APROBADA, ANULADA

    private String solicitante;

    private String observacion;

    @OneToMany(mappedBy = "requisicion", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<DetalleRequisicion> detalles = new ArrayList<>();
}