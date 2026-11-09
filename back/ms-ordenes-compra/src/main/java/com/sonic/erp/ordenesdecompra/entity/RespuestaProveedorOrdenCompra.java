
package com.sonic.erp.ordenesdecompra.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "respuesta_proveedor_orden_compra")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RespuestaProveedorOrdenCompra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_respuesta")
    private Long idRespuesta;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "id_orden",
            nullable = false,
            unique = true
    )
    private OrdenCompra ordenCompra;

    @Column(name = "respuesta", nullable = false, length = 20)
    private String respuesta;

    @Column(name = "referencia", nullable = false, length = 150)
    private String referencia;

    @Column(name = "origen", nullable = false, length = 30)
    private String origen;

    @Column(name = "observacion", length = 500)
    private String observacion;

    @Column(name = "fecha_respuesta", nullable = false)
    private LocalDateTime fechaRespuesta;
}
