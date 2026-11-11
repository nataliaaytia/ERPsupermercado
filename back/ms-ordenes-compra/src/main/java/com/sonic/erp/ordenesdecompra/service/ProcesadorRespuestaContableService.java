package com.sonic.erp.ordenesdecompra.service;

import com.sonic.erp.ordenesdecompra.dto.request.RespuestaContabilidadRequest;
import com.sonic.erp.ordenesdecompra.dto.response.SeguimientoRespuestaContableResponse;
import com.sonic.erp.ordenesdecompra.entity.CompromisoContable;
import com.sonic.erp.ordenesdecompra.repository.CompromisoContableRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class ProcesadorRespuestaContableService {

    private final CompromisoContableRepository compromisoRepository;

    public ProcesadorRespuestaContableService(CompromisoContableRepository compromisoRepository) {
        this.compromisoRepository = compromisoRepository;
    }

    @Transactional
    public SeguimientoRespuestaContableResponse procesarRespuestaContabilidad(RespuestaContabilidadRequest respuesta) {
        CompromisoContable compromiso = compromisoRepository.findByIdOrden(respuesta.getIdOrden())
                .orElseThrow(() -> new IllegalArgumentException("No se encontró ningún compromiso registrado para la orden ID: " + respuesta.getIdOrden()));

        if (compromiso.getMessageIdPubsub() != null && !compromiso.getMessageIdPubsub().trim().isEmpty()) {
            if (!compromiso.getMessageIdPubsub().equals(respuesta.getEventId().trim())) {
                throw new IllegalArgumentException(String.format(
                        "Inconsistencia en eventId. Se esperaba '%s' pero se recibió '%s'",
                        compromiso.getMessageIdPubsub(), respuesta.getEventId()
                ));
            }
        }

        String estadoActual = compromiso.getEstadoEnvio();
        if ("REGISTRADO_CONTABILIDAD".equalsIgnoreCase(estadoActual) || "RECHAZADO_CONTABILIDAD".equalsIgnoreCase(estadoActual)) {
            throw new IllegalArgumentException(String.format(
                    "Mensaje duplicado rechazado: La orden ID %d ya fue procesada previamente por Contabilidad con estado '%s'",
                    compromiso.getIdOrden(), estadoActual
            ));
        }

        String estadoPrevio = estadoActual;
        String resultadoNorm = respuesta.getEstado().trim().toUpperCase();

        SeguimientoRespuestaContableResponse response = new SeguimientoRespuestaContableResponse();
        response.setIdCompromiso(compromiso.getIdCompromiso());
        response.setIdOrden(compromiso.getIdOrden());
        response.setEventId(respuesta.getEventId());
        response.setEstadoPrevio(estadoPrevio);
        response.setResultadoContabilidad(resultadoNorm);
        response.setFechaProcesamiento(LocalDateTime.now());

        if ("REGISTRADO".equals(resultadoNorm) || "CONFIRMADO".equals(resultadoNorm)) {
            compromiso.setEstadoEnvio("REGISTRADO_CONTABILIDAD");
            compromiso.setErrorDetalle(null);

            String comprobante = respuesta.getNumeroComprobante() != null ? respuesta.getNumeroComprobante() : "COMP-ASIG-" + compromiso.getIdCompromiso();
            response.setNumeroComprobante(comprobante);
            response.setEstadoFinal("REGISTRADO_CONTABILIDAD");
            response.setDetalle("Compromiso presupuestario registrado exitosamente en Contabilidad. Comprobante: " + comprobante);
            response.setProcesado(true);

        } else if ("RECHAZADO".equals(resultadoNorm)) {
            compromiso.setEstadoEnvio("RECHAZADO_CONTABILIDAD");
            compromiso.setErrorDetalle("Rechazado por Contabilidad: " + respuesta.getMotivoRechazo());

            response.setNumeroComprobante(null);
            response.setEstadoFinal("RECHAZADO_CONTABILIDAD");
            response.setDetalle("El compromiso fue rechazado por Contabilidad. Motivo: " + respuesta.getMotivoRechazo());
            response.setProcesado(true);

        } else {
            throw new IllegalArgumentException("Estado no reconocido: '" + respuesta.getEstado() + "'. Se esperaba REGISTRADO o RECHAZADO");
        }

        compromisoRepository.save(compromiso);
        return response;
    }
}