package com.sonic.erp.ordenesdecompra.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;


@Entity
@Table(name = "orden_compra")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrdenCompra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_orden")
    private Long idOrden;

    @Column(name = "id_oferta", nullable = false, unique = true)
    private Long idOferta;

    @Column(name = "proveedor_id", nullable = false)
    private Long proveedorId;

    @Column(name = "numero", nullable = false, unique = true, length = 50)
    private String numero;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "estado", nullable = false, length = 30)
    private String estado;

    @Column(name = "total", precision = 12, scale = 2, nullable = false)
    private BigDecimal total;

    @Column(name = "observacion", length = 500)
    private String observacion;

    @Column(name = "aprobado_por", length = 100)
    private String aprobadoPor;

    @Column(name = "fecha_aprobacion")
    private LocalDateTime fechaAprobacion;

    @OneToMany(
            mappedBy = "ordenCompra",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<HistorialDevolucionOrdenCompra> historialDevoluciones =
            new ArrayList<>();

    public void agregarDevolucion(HistorialDevolucionOrdenCompra devolucion) {
        historialDevoluciones.add(devolucion);
        devolucion.setOrdenCompra(this);
    }

    @OneToMany(mappedBy = "ordenCompra", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DetalleOrdenCompra> detalles = new ArrayList<>();

    public void agregarDetalle(DetalleOrdenCompra detalle) {
        detalles.add(detalle);
        detalle.setOrdenCompra(this);
    }
}
