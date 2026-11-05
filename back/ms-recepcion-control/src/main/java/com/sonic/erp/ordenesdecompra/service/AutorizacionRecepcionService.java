package com.sonic.erp.ordenesdecompra.service;

import com.sonic.erp.ordenesdecompra.dto.request.ConfirmarAutorizacionRequest;
import com.sonic.erp.ordenesdecompra.dto.response.AutorizacionRecepcionResponse;
import com.sonic.erp.ordenesdecompra.dto.response.LineaAutorizadaResponse;
import com.sonic.erp.ordenesdecompra.entity.DetalleRecepcion;
import com.sonic.erp.ordenesdecompra.entity.Recepcion;
import com.sonic.erp.ordenesdecompra.repository.DetalleRecepcionRepository;
import com.sonic.erp.ordenesdecompra.repository.RecepcionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AutorizacionRecepcionService {
    private final RecepcionRepository recepcionRepository;
    private final DetalleRecepcionRepository detalleRecepcionRepository;
    public AutorizacionRecepcionService(RecepcionRepository recepcionRepository,
                                        DetalleRecepcionRepository detalleRecepcionRepository) {
        this.recepcionRepository = recepcionRepository;
        this.detalleRecepcionRepository = detalleRecepcionRepository;
    }

    @Transactional
    public AutorizacionRecepcionResponse confirmarAutorizacion(ConfirmarAutorizacionRequest request) {
        Recepcion recepcion = recepcionRepository.findById(request.getIdRecepcion())
                .orElseThrow(() -> new IllegalArgumentException("No se encontró la recepción con ID: " + request.getIdRecepcion()));

        if ("AUTORIZADA".equalsIgnoreCase(recepcion.getEstado())) {
            AutorizacionRecepcionResponse responseYaAutorizada = construirRespuesta(recepcion, true);
            responseYaAutorizada.setMensaje("La recepción ya se encontraba autorizada previamente. Operación idempotente ejecutada sin cambios duplicados.");
            return responseYaAutorizada;
        }

        List<DetalleRecepcion> detalles = detalleRecepcionRepository.findByRecepcionIdRecepcion(recepcion.getIdRecepcion());
        if (detalles.isEmpty()) {
            throw new IllegalArgumentException("La recepción no contiene líneas de detalle para autorizar");
        }

        for (DetalleRecepcion det : detalles) {
            if (det.getCantidadAceptada() == null) {
                throw new IllegalArgumentException("La recepción aún cuenta con líneas sin inspeccionar (cantidad aceptada no definida)");
            }
        }

        recepcion.setEstado("AUTORIZADA");
        recepcionRepository.save(recepcion);

        AutorizacionRecepcionResponse response = construirRespuesta(recepcion, false);
        response.setMensaje("Validación registrada con éxito. Mercadería conforme autorizada y unidades defectuosas excluidas.");
        return response;
    }

    @Transactional(readOnly = true)
    public AutorizacionRecepcionResponse consultarResultado(Long idRecepcion) {
        Recepcion recepcion = recepcionRepository.findById(idRecepcion)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró la recepción con ID: " + idRecepcion));

        return construirRespuesta(recepcion, "AUTORIZADA".equalsIgnoreCase(recepcion.getEstado()));
    }

    private AutorizacionRecepcionResponse construirRespuesta(Recepcion recepcion, boolean yaEstabaAutorizada) {
        List<DetalleRecepcion> detalles = detalleRecepcionRepository.findByRecepcionIdRecepcion(recepcion.getIdRecepcion());
        List<LineaAutorizadaResponse> lineas = new ArrayList<>();

        int totalAceptadas = 0;
        int totalExcluidas = 0;

        for (DetalleRecepcion det : detalles) {
            int recibida = det.getCantidadRecibida() != null ? det.getCantidadRecibida() : 0;
            int aceptada = det.getCantidadAceptada() != null ? det.getCantidadAceptada() : 0;
            int rechazada = Math.max(0, recibida - aceptada);

            totalAceptadas += aceptada;
            totalExcluidas += rechazada;

            LineaAutorizadaResponse linea = new LineaAutorizadaResponse();
            linea.setIdDetalle(det.getIdDetalle());
            linea.setProductoId(det.getProductoId());
            linea.setCantidadRecibida(recibida);
            linea.setCantidadAceptadaAutorizada(aceptada);
            linea.setCantidadRechazadaExcluida(rechazada);
            lineas.add(linea);
        }

        AutorizacionRecepcionResponse res = new AutorizacionRecepcionResponse();
        res.setIdRecepcion(recepcion.getIdRecepcion());
        res.setEstadoRecepcion(recepcion.getEstado());
        res.setYaEstabaAutorizada(yaEstabaAutorizada);
        res.setFechaAutorizacion(LocalDateTime.now());
        res.setTotalUnidadesAutorizadas(totalAceptadas);
        res.setTotalUnidadesExcluidas(totalExcluidas);
        res.setLineasAutorizadas(lineas);

        return res;
    }
}