package com.sonic.erp.proveedores.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "condiciones_comerciales")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CondicionComercial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_condicion")
    private Long idCondicion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_proveedor", nullable = false)
    private Proveedor proveedor;

    @Column(name = "forma_pago", nullable = false, length = 50)
    private String formaPago;

    @Column(name = "dias_credito")
    private Integer diasCredito;

    @Column(name = "monto_minimo_compra", precision = 12, scale = 2)
    private BigDecimal montoMinimoCompra;

    @Column(name = "plazo_entrega_dias", nullable = false)
    private Integer plazoEntregaDias;

    @Column(name = "observaciones", length = 250)
    private String observaciones;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;

    @PrePersist
    public void alCrear() {
        if (this.fechaRegistro == null) {
            this.fechaRegistro = LocalDateTime.now();
        }
    }
}