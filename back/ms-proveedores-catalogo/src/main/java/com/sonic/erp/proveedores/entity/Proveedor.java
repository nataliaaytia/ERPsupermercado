package com.sonic.erp.proveedores.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "proveedores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Proveedor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_proveedor")
    private Long idProveedor;

    @Column(name = "nit_ruc", nullable = false, unique = true, length = 30)
    private String nitRuc;

    @Column(name = "razon_social", nullable = false, length = 150)
    private String razonSocial;

    @Column(name = "direccion", nullable = false, length = 150)
    private String direccion;

    @Column (name = "telefono", nullable = false,length = 30)
    private String telefono;

    @Column (name = "correo", nullable = false, length = 100)
    private String correo;

    @Column (name = "estado", nullable = false, length = 30)
    private String estado;

    @Column (name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    //Al crear un nuevo proveedor se genera automaticamente la fecha y el estado se pone en "Registrado", se puede cambiar despues
    @PrePersist
    protected void alCrear() {
        this.fechaCreacion = LocalDateTime.now();
        if(this.estado == null) {
            this.estado = "Registrado";
        }
    }
}
