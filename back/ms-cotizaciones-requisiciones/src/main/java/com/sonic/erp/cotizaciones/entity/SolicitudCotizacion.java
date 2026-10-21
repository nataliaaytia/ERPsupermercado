package com.sonic.erp.cotizaciones.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "solicitudes_cotizacion")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudCotizacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idSolicitud;

    private LocalDate fecha;

    private LocalDate fechaLimite;

    private String estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_requisicion")
    private Requisicion requisicion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_consolidacion")
    private ConsolidacionRequisiciones consolidacion;
}