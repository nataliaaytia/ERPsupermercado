package com.sonic.erp.ordenesdecompra.service;

import com.sonic.erp.ordenesdecompra.dto.request.RegistrarInspeccionRequest;
import com.sonic.erp.ordenesdecompra.dto.response.InspeccionResponse;
import com.sonic.erp.ordenesdecompra.entity.DetalleRecepcion;
import com.sonic.erp.ordenesdecompra.entity.InspeccionCalidad;
import com.sonic.erp.ordenesdecompra.repository.DetalleRecepcionRepository;
import com.sonic.erp.ordenesdecompra.repository.InspeccionCalidadRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class InspeccionCalidadService {

    private final DetalleRecepcionRepository detalleRecepcionRepository;
    private final InspeccionCalidadRepository inspeccionCalidadRepository;

    public InspeccionCalidadService(DetalleRecepcionRepository detalleRecepcionRepository,
                                    InspeccionCalidadRepository inspeccionCalidadRepository) {
        this.detalleRecepcionRepository = detalleRecepcionRepository;
        this.inspeccionCalidadRepository = inspeccionCalidadRepository;
    }

    @Transactional
    public InspeccionResponse registrarInspeccion(RegistrarInspeccionRequest request) {
        DetalleRecepcion detalle = detalleRecepcionRepository.findById(request.getIdDetalle())
                .orElseThrow(() -> new IllegalArgumentException("No se encontró el detalle de recepción con ID: " + request.getIdDetalle()));
        int totalInspeccionado = request.getCantidadConforme() + request.getCantidadRechazada();
        if (totalInspeccionado != detalle.getCantidadRecibida()) {
            throw new IllegalArgumentException(String.format(
                    "La suma de conforme (%d) y rechazado (%d) debe ser igual a la cantidad recibida (%d)",
                    request.getCantidadConforme(), request.getCantidadRechazada(), detalle.getCantidadRecibida()
            ));
        }
        if (request.getCantidadRechazada() > 0 && (request.getObservacion() == null || request.getObservacion().trim().isEmpty())) {
            throw new IllegalArgumentException("Es obligatorio especificar un motivo/observación cuando hay mercadería rechazada");
        }
        detalle.setCantidadAceptada(request.getCantidadConforme());
        detalleRecepcionRepository.save(detalle);
        String resultado = (request.getCantidadRechazada() == 0) ? "CONFORME" :
                (request.getCantidadConforme() == 0) ? "RECHAZADO_TOTAL" : "CONFORME_PARCIAL";
        InspeccionCalidad inspeccion = new InspeccionCalidad();
        inspeccion.setDetalleRecepcion(detalle);
        inspeccion.setFecha(LocalDate.now());
        inspeccion.setResultado(resultado);
        inspeccion.setObservacion(request.getObservacion());
        InspeccionCalidad guardada = inspeccionCalidadRepository.save(inspeccion);
        InspeccionResponse response = new InspeccionResponse();
        response.setIdInspeccion(guardada.getIdInspeccion());
        response.setIdDetalle(detalle.getIdDetalle());
        response.setFecha(guardada.getFecha());
        response.setResultado(guardada.getResultado());
        response.setCantidadAceptada(detalle.getCantidadAceptada());
        response.setCantidadRecibida(detalle.getCantidadRecibida());
        response.setObservacion(guardada.getObservacion());

        return response;
    }
}