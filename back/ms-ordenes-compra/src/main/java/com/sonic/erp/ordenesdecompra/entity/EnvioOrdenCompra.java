
package com.sonic.erp.ordenesdecompra.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "envio_orden_compra")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnvioOrdenCompra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_envio")
    private Long idEnvio;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_orden", nullable = false)
    private OrdenCompra ordenCompra;

    @Column(name = "canal", nullable = false, length = 30)
    private String canal;

    @Column(name = "destinatario", length = 150)
    private String destinatario;

    @Column(name = "estado_resultado", nullable = false, length = 30)
    private String estadoResultado;

    @Column(name = "fecha_intento", nullable = false)
    private LocalDateTime fechaIntento;

    @Column(name = "fecha_aceptacion")
    private LocalDateTime fechaAceptacion;

    @Column(name = "detalle_error", length = 500)
    private String detalleError;
}
