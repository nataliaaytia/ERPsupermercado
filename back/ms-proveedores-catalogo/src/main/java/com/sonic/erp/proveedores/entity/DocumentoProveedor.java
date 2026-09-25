package com.sonic.erp.proveedores.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "documentos_proveedor")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class DocumentoProveedor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_documento")
    private Long idDocumento;

    @Column(name = "tipo_documento", nullable = false, length = 30)
    private String tipoDocumento;

    @Column (name = "numero_documento", nullable = false, unique = true, length = 30)
    private String numeroDocumento;

    @Column (name = "fecha_vencimiento", nullable = false)
    private LocalDate fechaVencimiento;

    @Column (name = "archivo", nullable = false, length = 100)
    private String archivo;

    //Asosiacion de muchos a uno a proveedores
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_proveedor", nullable = false)
    private Proveedor proveedor;
}
