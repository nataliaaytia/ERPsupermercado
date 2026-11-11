package com.sonic.erp.ordenesdecompra.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sonic.erp.ordenesdecompra.dto.request.RespuestaContabilidadRequest;
import com.sonic.erp.ordenesdecompra.dto.response.SeguimientoRespuestaContableResponse;
import org.springframework.stereotype.Service;

@Service
public class PubSubSuscripcionContableService {

    private final ObjectMapper objectMapper;
    private final ProcesadorRespuestaContableService procesadorService;

    public PubSubSuscripcionContableService(ObjectMapper objectMapper,
                                            ProcesadorRespuestaContableService procesadorService) {
        this.objectMapper = objectMapper;
        this.procesadorService = procesadorService;
    }

    public SeguimientoRespuestaContableResponse consumirRespuestaContableJson(String payloadJson) throws Exception {
        System.out.println("==================================================");
        System.out.println("[PUB/SUB CONTABILIDAD - SUSCRIPCIÓN] Mensaje recibido:");
        System.out.println(payloadJson);
        System.out.println("==================================================");

        RespuestaContabilidadRequest request = objectMapper.readValue(payloadJson, RespuestaContabilidadRequest.class);
        return procesadorService.procesarRespuestaContabilidad(request);
    }
}