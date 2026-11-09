
package com.sonic.erp.ordenesdecompra.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "historial_devolucion_orden_compra")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistorialDevolucionOrdenCompra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_devolucion")
    private Long idDevolucion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_orden", nullable = false)
    private OrdenCompra ordenCompra;

    @Column(name = "motivo", nullable = false, length = 500)
    private String motivo;

    @Column(name = "responsable", nullable = false, length = 100)
    private String responsable;

    @Column(name = "fecha_devolucion", nullable = false)
    private LocalDateTime fechaDevolucion;
}
