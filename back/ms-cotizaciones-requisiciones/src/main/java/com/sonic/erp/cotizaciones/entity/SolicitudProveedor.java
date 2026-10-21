package com.sonic.erp.cotizaciones.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "solicitudes_proveedores",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_solicitud_proveedor",
                columnNames = {"id_solicitud", "proveedor_id"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudProveedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idSeleccion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_solicitud", nullable = false)
    private SolicitudCotizacion solicitud;

    @Column(name = "proveedor_id", nullable = false)
    private Long proveedorId;
}
