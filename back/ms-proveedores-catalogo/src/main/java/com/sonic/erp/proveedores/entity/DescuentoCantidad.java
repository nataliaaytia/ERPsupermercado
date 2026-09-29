package com.sonic.erp.proveedores.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "descuentos_cantidad")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DescuentoCantidad {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_descuento")
    private Long idDescuento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_catalogo", nullable = false)
    private CatalogoComercial catalogoComercial;

    @Column(name = "cantidad_minima", nullable = false)
    private Integer cantidadMinima;

    @Column(name = "cantidad_maxima")
    private Integer cantidadMaxima;//puede ser nula

    @Column(name = "porcentaje_descuento", nullable = false, precision = 5, scale = 2)
    private BigDecimal porcentajeDescuento;
}