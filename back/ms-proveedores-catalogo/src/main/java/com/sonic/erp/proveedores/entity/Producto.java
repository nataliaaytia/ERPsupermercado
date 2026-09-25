package com.sonic.erp.proveedores.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "productos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto")
    private Long idProducto;

    @Column (name = "codigo_sku", nullable = false, unique = true, length = 50)
    private String codigoSku;

    @Column (name = "descripcion", nullable = false, length = 200)
    private String descripcion;

    @Column (name = "unidad", nullable = false, length = 20)
    private String unidad;

    @Column(name = "precio_referencial", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioReferencial;

    @Column (name = "estado", nullable = false, length = 20)
    private String estado;

    @PrePersist
    public void alCrear() {
        if (this.estado == null) {
            this.estado = "Activo";
        }
    }
}
