package com.sonic.erp.proveedores.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;


@Entity
@Table (name = "catalogo_comercial")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CatalogoComercial {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    @Column(name = "id_catalogo")
    private Long idCatalogo;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column (name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Column(name = "condiciones", nullable = false, length = 100)
    private String condiciones;

    @Column (name = "archivo", nullable = false, length = 100)
    private String archivo;

    @ManyToOne (fetch = FetchType.LAZY)
    @JoinColumn(name = "id_proveedor", nullable = false)
    private Proveedor proveedor;


    @ManyToOne (fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

}
