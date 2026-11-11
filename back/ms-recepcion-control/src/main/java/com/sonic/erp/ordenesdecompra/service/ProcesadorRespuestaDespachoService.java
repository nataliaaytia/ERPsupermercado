package com.sonic.erp.ordenesdecompra.service;

import com.sonic.erp.ordenesdecompra.dto.request.RespuestaDisponibilidadRequest;
import com.sonic.erp.ordenesdecompra.dto.response.SeguimientoRespuestaDespachoResponse;
import com.sonic.erp.ordenesdecompra.entity.EventoDisponibilidadDespacho;
import com.sonic.erp.ordenesdecompra.entity.Recepcion;
import com.sonic.erp.ordenesdecompra.repository.EventoDisponibilidadDespachoRepository;
import com.sonic.erp.ordenesdecompra.repository.RecepcionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class ProcesadorRespuestaDespachoService {

    private final RecepcionRepository recepcionRepository;
    private final EventoDisponibilidadDespachoRepository eventoRepository;

    public ProcesadorRespuestaDespachoService(RecepcionRepository recepcionRepository,
                                              EventoDisponibilidadDespachoRepository eventoRepository) {
        this.recepcionRepository = recepcionRepository;
        this.eventoRepository = eventoRepository;
    }

    @Transactional
    public SeguimientoRespuestaDespachoResponse procesarRespuesta(RespuestaDisponibilidadRequest respuesta) {
        EventoDisponibilidadDespacho evento = eventoRepository.findByIdRecepcion(respuesta.getRecepcionId())
                .orElseThrow(() -> new IllegalArgumentException("No se encontró evento previo de disponibilidad para recepcionId: " + respuesta.getRecepcionId()));

        if (evento.getMessageIdPubsub() != null && !evento.getMessageIdPubsub().trim().isEmpty()) {
            if (!evento.getMessageIdPubsub().equals(respuesta.getCorrelationId().trim())) {
                throw new IllegalArgumentException(String.format(
                        "Inconsistencia en correlationId. Se esperaba '%s' pero se recibió '%s'",
                        evento.getMessageIdPubsub(), respuesta.getCorrelationId()
                ));
            }
        }

        Recepcion recepcion = recepcionRepository.findById(respuesta.getRecepcionId())
                .orElseThrow(() -> new IllegalArgumentException("No existe la recepción con ID: " + respuesta.getRecepcionId()));

        String estadoPrevioRecepcion = recepcion.getEstado();
        String estadoPrevioEvento = evento.getEstadoEnvio();
        String estadoNorm = respuesta.getEstado().trim().toUpperCase();

        SeguimientoRespuestaDespachoResponse response = new SeguimientoRespuestaDespachoResponse();
        response.setIdRecepcion(recepcion.getIdRecepcion());
        response.setCorrelationId(respuesta.getCorrelationId());
        response.setEstadoPrevio(estadoPrevioRecepcion);
        response.setResultadoDespachos(estadoNorm);
        response.setFechaProcesamiento(LocalDateTime.now());

        if ("CONFIRMADO".equals(estadoNorm) || "ACEPTADO".equals(estadoNorm)) {
            recepcion.setEstado("DISPONIBLE_DESPACHO");
            evento.setEstadoEnvio("CONFIRMADO_DESPACHOS");
            evento.setErrorDetalle(null);

            String observacion = (recepcion.getObservacion() != null ? recepcion.getObservacion() + " | " : "")
                    + "Despacho Habilitado. Plan: " + (respuesta.getCodigoPlanificacion() != null ? respuesta.getCodigoPlanificacion() : "ASIGNADO");
            recepcion.setObservacion(observacion);

            response.setProcesado(true);
            response.setEstadoFinal("DISPONIBLE_DESPACHO");
            response.setDetalle("Mercadería confirmada y habilitada para planificación en Gestión de Entregas/Despachos");

        } else if ("RECHAZADO".equals(estadoNorm)) {
            recepcion.setEstado("RECHAZADO_DESPACHO");
            evento.setEstadoEnvio("RECHAZADO_DESPACHOS");
            evento.setErrorDetalle("Rechazo por Despachos: " + respuesta.getMotivoRechazo());

            String observacion = (recepcion.getObservacion() != null ? recepcion.getObservacion() + " | " : "")
                    + "Rechazado por Despachos: " + respuesta.getMotivoRechazo();
            recepcion.setObservacion(observacion);

            response.setProcesado(true);
            response.setEstadoFinal("RECHAZADO_DESPACHO");
            response.setDetalle("Disponibilidad rechazada por Despachos. Motivo: " + respuesta.getMotivoRechazo());

        } else {
            throw new IllegalArgumentException("Estado de respuesta no reconocido: '" + respuesta.getEstado() + "'. Se esperaba CONFIRMADO o RECHAZADO");
        }

        recepcionRepository.save(recepcion);
        eventoRepository.save(evento);

        return response;
    }
}