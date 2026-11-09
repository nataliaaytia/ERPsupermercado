
package com.sonic.erp.ordenesdecompra.service;

import com.sonic.erp.ordenesdecompra.dto.request.AnularOrdenCompraRequest;
import com.sonic.erp.ordenesdecompra.entity.OrdenCompra;
import com.sonic.erp.ordenesdecompra.repository.OrdenCompraRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Set;

@Service
public class AnularOrdenCompraService {

    private final OrdenCompraRepository repository;
    private final ConsultaRecepcionesOrdenService consultaRecepciones;

    public AnularOrdenCompraService(
            OrdenCompraRepository repository,
            ConsultaRecepcionesOrdenService consultaRecepciones) {

        this.repository = repository;
        this.consultaRecepciones = consultaRecepciones;
    }

    @Transactional
    public ResultadoAnulacion anularOrden(
            Long idOrden,
            AnularOrdenCompraRequest request) {

        // 1. Validar el identificador.
        if (idOrden == null || idOrden <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El identificador de la orden no es valido");
        }

        // 2. Validar el motivo.
        if (request == null
                || request.motivo() == null
                || request.motivo().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe indicar el motivo de la anulacion");
        }

        String motivo = request.motivo().trim();

        if (motivo.length() > 500) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El motivo no puede superar 500 caracteres");
        }

        // 3. Buscar la orden y bloquearla durante la operacion.
        OrdenCompra orden = repository.findByIdForUpdate(idOrden)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La orden de compra no existe"));

        // 4. Validar el estado de la orden.
        Set<String> estadosAnulables = Set.of(
                "BORRADOR",
                "PENDIENTE_APROBACION",
                "APROBADA",
                "ENVIADA",
                "ACEPTADA_PROVEEDOR",
                "RECHAZADA_PROVEEDOR"
        );

        if (!estadosAnulables.contains(orden.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La orden no se puede anular en su estado actual");
        }

        // 5. Consultar al microservicio de Recepcion.
        // Si falla la API, se bloquea la anulacion.
        boolean tieneRecepciones =
                consultaRecepciones.tieneRecepciones(idOrden);

        if (tieneRecepciones) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede anular una orden con recepciones registradas");
        }

        // 6. Registrar la anulacion.
        LocalDateTime fecha = LocalDateTime.now(
                ZoneId.of("America/La_Paz"));

        orden.setEstado("ANULADA");
        orden.setMotivoAnulacion(motivo);
        orden.setFechaAnulacion(fecha);

        repository.saveAndFlush(orden);

        // 7. Devolver el resultado.
        return new ResultadoAnulacion(
                orden.getIdOrden(),
                orden.getNumero(),
                orden.getEstado(),
                orden.getMotivoAnulacion(),
                orden.getFechaAnulacion()
        );
    }

    public record ResultadoAnulacion(
            Long idOrden,
            String numero,
            String estadoOrden,
            String motivoAnulacion,
            LocalDateTime fechaAnulacion
    ) {
    }
}
