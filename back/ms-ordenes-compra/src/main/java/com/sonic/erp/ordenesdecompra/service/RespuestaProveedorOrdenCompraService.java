
package com.sonic.erp.ordenesdecompra.service;

import com.sonic.erp.ordenesdecompra.dto.request.RegistrarRespuestaProveedorRequest;
import com.sonic.erp.ordenesdecompra.entity.OrdenCompra;
import com.sonic.erp.ordenesdecompra.entity.RespuestaProveedorOrdenCompra;
import com.sonic.erp.ordenesdecompra.repository.OrdenCompraRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Objects;
import java.util.Set;

@Service
public class RespuestaProveedorOrdenCompraService {

    private final OrdenCompraRepository repository;

    public RespuestaProveedorOrdenCompraService(
            OrdenCompraRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public ResultadoRespuesta registrarRespuesta(
            Long idOrden,
            RegistrarRespuestaProveedorRequest request) {

        if (idOrden == null || idOrden <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El identificador de la orden no es valido");
        }

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe proporcionar la respuesta del proveedor");
        }

        validarRequest(request);

        OrdenCompra orden = repository.findByIdForUpdate(idOrden)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La orden de compra no existe"));

        String respuesta = request.respuesta();
        String referencia = request.referencia().trim();
        String origen = request.origen();
        String observacion = normalizarObservacion(
                request.observacion());

        // Verificar si ya existe una respuesta registrada.
        RespuestaProveedorOrdenCompra existente =
                orden.getRespuestaProveedor();

        if (existente != null) {

            boolean mismaRespuesta =
                    Objects.equals(existente.getRespuesta(), respuesta)
                            && Objects.equals(existente.getReferencia(), referencia)
                            && Objects.equals(existente.getOrigen(), origen)
                            && Objects.equals(
                            normalizarObservacion(existente.getObservacion()),
                            observacion);

            if (!mismaRespuesta) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "La orden ya tiene una respuesta diferente registrada");
            }

            // Peticion identica: no crea un segundo registro.
            return construirResultado(orden, existente, true);
        }

        // Solo se registra una respuesta inicial en ordenes ENVIADAS.
        if (!"ENVIADA".equals(orden.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Solo se pueden registrar respuestas de ordenes enviadas");
        }

        LocalDateTime fecha = LocalDateTime.now(
                ZoneId.of("America/La_Paz"));

        RespuestaProveedorOrdenCompra nuevaRespuesta =
                RespuestaProveedorOrdenCompra.builder()
                        .respuesta(respuesta)
                        .referencia(referencia)
                        .origen(origen)
                        .observacion(observacion)
                        .fechaRespuesta(fecha)
                        .build();

        orden.registrarRespuesta(nuevaRespuesta);

        if ("ACEPTADA".equals(respuesta)) {
            orden.setEstado("ACEPTADA_PROVEEDOR");
        } else {
            orden.setEstado("RECHAZADA_PROVEEDOR");
        }

        repository.saveAndFlush(orden);

        return construirResultado(orden, nuevaRespuesta, false);
    }

    private void validarRequest(
            RegistrarRespuestaProveedorRequest request) {

        if (request.respuesta() == null
                || !Set.of("ACEPTADA", "RECHAZADA")
                .contains(request.respuesta())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La respuesta debe ser ACEPTADA o RECHAZADA");
        }

        if (request.referencia() == null
                || request.referencia().isBlank()
                || request.referencia().length() > 150) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La referencia es obligatoria y no puede superar 150 caracteres");
        }

        if (request.origen() == null
                || !Set.of("CORREO", "WHATSAPP", "TELEFONO", "OTRO")
                .contains(request.origen())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El origen debe ser CORREO, WHATSAPP, TELEFONO u OTRO");
        }

        if (request.observacion() != null
                && request.observacion().length() > 500) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La observacion no puede superar 500 caracteres");
        }
    }

    private String normalizarObservacion(String observacion) {
        if (observacion == null || observacion.isBlank()) {
            return null;
        }
        return observacion.trim();
    }

    private ResultadoRespuesta construirResultado(
            OrdenCompra orden,
            RespuestaProveedorOrdenCompra respuesta,
            boolean yaRegistrada) {

        return new ResultadoRespuesta(
                orden.getIdOrden(),
                orden.getNumero(),
                orden.getEstado(),
                respuesta.getRespuesta(),
                respuesta.getReferencia(),
                respuesta.getOrigen(),
                respuesta.getObservacion(),
                respuesta.getFechaRespuesta(),
                yaRegistrada
        );
    }

    public record ResultadoRespuesta(
            Long idOrden,
            String numero,
            String estadoOrden,
            String respuesta,
            String referencia,
            String origen,
            String observacion,
            LocalDateTime fechaRespuesta,
            boolean yaRegistrada
    ) {
    }
}
