package com.sonic.erp.ordenesdecompra.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sonic.erp.ordenesdecompra.dto.request.RespuestaDisponibilidadRequest;
import com.sonic.erp.ordenesdecompra.dto.response.SeguimientoRespuestaDespachoResponse;
import org.springframework.stereotype.Service;

@Service
public class PubSubSuscripcionDespachoService {

    private final ObjectMapper objectMapper;
    private final ProcesadorRespuestaDespachoService procesadorService;

    public PubSubSuscripcionDespachoService(ObjectMapper objectMapper,
                                            ProcesadorRespuestaDespachoService procesadorService) {
        this.objectMapper = objectMapper;
        this.procesadorService = procesadorService;
    }

    public SeguimientoRespuestaDespachoResponse consumirMensajeRespuestaJson(String payloadJson) throws Exception {
        System.out.println("==================================================");
        System.out.println("[PUB/SUB DESPACHOS - SUSCRIPCIÓN] Mensaje recibido:");
        System.out.println(payloadJson);
        System.out.println("==================================================");

        RespuestaDisponibilidadRequest respuesta = objectMapper.readValue(payloadJson, RespuestaDisponibilidadRequest.class);
        return procesadorService.procesarRespuesta(respuesta);
    }
}