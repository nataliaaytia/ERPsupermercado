
package com.sonic.erp.ordenesdecompra.service;

import com.sonic.erp.ordenesdecompra.entity.EnvioOrdenCompra;
import com.sonic.erp.ordenesdecompra.entity.OrdenCompra;
import com.sonic.erp.ordenesdecompra.repository.OrdenCompraRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
public class EnvioOrdenCompraService {

    private final OrdenCompraRepository repository;
    private final ConsultaProveedorOrdenService proveedores;
    private final PdfOrdenCompraService pdfService;
    private final CorreoOrdenCompraService correoService;

    public EnvioOrdenCompraService(
            OrdenCompraRepository repository,
            ConsultaProveedorOrdenService proveedores,
            PdfOrdenCompraService pdfService,
            CorreoOrdenCompraService correoService) {

        this.repository = repository;
        this.proveedores = proveedores;
        this.pdfService = pdfService;
        this.correoService = correoService;
    }

    @Transactional
    public ResultadoEnvio enviarOrden(Long idOrden) {

        if (idOrden == null || idOrden <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El identificador de la orden no es valido");
        }

        OrdenCompra orden = repository.findByIdForUpdate(idOrden)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La orden de compra no existe"));

        if (!"APROBADA".equals(orden.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Solo se pueden enviar ordenes aprobadas");
        }

        LocalDateTime ahora = LocalDateTime.now(
                ZoneId.of("America/La_Paz"));

        EnvioOrdenCompra intento = EnvioOrdenCompra.builder()
                .canal("CORREO")
                .estadoResultado("FALLIDO")
                .fechaIntento(ahora)
                .build();

        String destinatario = null;

        try {
            // Obtener los datos de contacto del proveedor.
            var proveedor = proveedores.obtenerContacto(
                    orden.getProveedorId());

            destinatario = proveedor.correo().trim();
            intento.setDestinatario(destinatario);

            // Generar documento adjunto.
            byte[] documento = pdfService.generarPdf(orden);

            // Enviar el correo mediante SMTP.
            correoService.enviarOrden(
                    destinatario,
                    "Orden de compra " + orden.getNumero(),
                    "Estimado proveedor:\n\n"
                            + "Adjuntamos la orden de compra "
                            + orden.getNumero()
                            + ".\n\nSaludos.",
                    documento
            );

            // El servidor SMTP acepto el mensaje.
            intento.setEstadoResultado("ACEPTADO_POR_SMTP");
            intento.setFechaAceptacion(
                    LocalDateTime.now(
                            ZoneId.of("America/La_Paz")));

            orden.setEstado("ENVIADA");

        } catch (RuntimeException e) {

            // Si falla, la orden permanece APROBADA.
            String error = e instanceof ResponseStatusException r
                    ? r.getReason()
                    : e.getMessage();

            if (error == null || error.isBlank()) {
                error = "No se pudo completar el envio";
            }

            intento.setDetalleError(
                    error.substring(0, Math.min(error.length(), 500))
            );
        }

        // Guardar el intento exitoso o fallido.
        orden.agregarEnvio(intento);
        repository.saveAndFlush(orden);

        return new ResultadoEnvio(
                orden.getIdOrden(),
                orden.getNumero(),
                orden.getEstado(),
                intento.getEstadoResultado(),
                destinatario,
                intento.getDetalleError()
        );
    }

    public record ResultadoEnvio(
            Long idOrden,
            String numero,
            String estadoOrden,
            String resultado,
            String destinatario,
            String detalleError
    ) {
    }
}
