package com.sonic.erp.ordenesdecompra.service;

import com.sonic.erp.ordenesdecompra.dto.request.ConfirmarDisponibilidadRequest;
import com.sonic.erp.ordenesdecompra.dto.request.LineaDisponiblePayload;
import com.sonic.erp.ordenesdecompra.dto.response.DisponibilidadDespachoResponse;
import com.sonic.erp.ordenesdecompra.dto.response.MercaderiaDisponiblePubSubPayload;
import com.sonic.erp.ordenesdecompra.entity.DetalleRecepcion;
import com.sonic.erp.ordenesdecompra.entity.EventoDisponibilidadDespacho;
import com.sonic.erp.ordenesdecompra.entity.Recepcion;
import com.sonic.erp.ordenesdecompra.repository.DetalleRecepcionRepository;
import com.sonic.erp.ordenesdecompra.repository.EventoDisponibilidadDespachoRepository;
import com.sonic.erp.ordenesdecompra.repository.RecepcionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class EventoDisponibilidadService {

    private final RecepcionRepository recepcionRepository;
    private final DetalleRecepcionRepository detalleRecepcionRepository;
    private final EventoDisponibilidadDespachoRepository eventoRepository;
    private final PubSubDespachosService pubSubService;

    public EventoDisponibilidadService(RecepcionRepository recepcionRepository,
                                       DetalleRecepcionRepository detalleRecepcionRepository,
                                       EventoDisponibilidadDespachoRepository eventoRepository,
                                       PubSubDespachosService pubSubService) {
        this.recepcionRepository = recepcionRepository;
        this.detalleRecepcionRepository = detalleRecepcionRepository;
        this.eventoRepository = eventoRepository;
        this.pubSubService = pubSubService;
    }

    @Transactional
    public DisponibilidadDespachoResponse notificarDisponibilidad(ConfirmarDisponibilidadRequest request) {
        Recepcion recepcion = recepcionRepository.findById(request.getIdRecepcion())
                .orElseThrow(() -> new IllegalArgumentException("No se encontró la recepción con ID: " + request.getIdRecepcion()));
        String estado = recepcion.getEstado();
        if (!"AUTORIZADA".equalsIgnoreCase(estado) && !"VALIDADA".equalsIgnoreCase(estado)) {
            throw new IllegalArgumentException("La recepción debe estar autorizada/validada para habilitar disponibilidad. Estado actual: " + estado);
        }
        eventoRepository.findByIdRecepcion(recepcion.getIdRecepcion()).ifPresent(e -> {
            if ("ENVIADO".equalsIgnoreCase(e.getEstadoEnvio())) {
                throw new IllegalArgumentException("La recepción ID " + recepcion.getIdRecepcion() + " ya tiene un evento MercaderiaDisponible enviado previamente (MessageID: " + e.getMessageIdPubsub() + ")");
            }
        });
        List<DetalleRecepcion> detalles = detalleRecepcionRepository.findByRecepcionIdRecepcion(recepcion.getIdRecepcion());
        List<LineaDisponiblePayload> lineasDisponibles = new ArrayList<>();
        int totalDisponible = 0;

        for (DetalleRecepcion det : detalles) {
            int aceptada = det.getCantidadAceptada() != null ? det.getCantidadAceptada() : 0;
            if (aceptada > 0) {
                LineaDisponiblePayload linea = new LineaDisponiblePayload();
                linea.setIdDetalle(det.getIdDetalle());
                linea.setProductoId(det.getProductoId());
                linea.setCantidadDisponible(aceptada);
                lineasDisponibles.add(linea);
                totalDisponible += aceptada;
            }
        }

        if (totalDisponible <= 0) {
            throw new IllegalArgumentException("La recepción no cuenta con cantidades aceptadas conformes para despacho");
        }
        EventoDisponibilidadDespacho evento = eventoRepository.findByIdRecepcion(recepcion.getIdRecepcion())
                .orElse(new EventoDisponibilidadDespacho());

        evento.setIdRecepcion(recepcion.getIdRecepcion());
        evento.setNombreEvento("MercaderiaDisponible");
        evento.setTotalUnidadesDisponibles(totalDisponible);
        evento.setFechaEvento(LocalDateTime.now());
        evento.setEstadoEnvio("PENDIENTE");
        evento = eventoRepository.save(evento);
        MercaderiaDisponiblePubSubPayload payload = new MercaderiaDisponiblePubSubPayload();
        payload.setEvento("MercaderiaDisponible");
        payload.setIdRecepcion(recepcion.getIdRecepcion());
        payload.setTotalUnidadesDisponibles(totalDisponible);
        payload.setUbicacionAlmacen(request.getUbicacionAlmacen() != null ? request.getUbicacionAlmacen() : "ALMACEN_CENTRAL");
        payload.setFechaDisponibilidad(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        payload.setLineasDisponibles(lineasDisponibles);
        try {
            String messageId = pubSubService.publicarMercaderiaDisponible(payload);
            evento.setEstadoEnvio("ENVIADO");
            evento.setMessageIdPubsub(messageId);
            evento.setFechaEnvio(LocalDateTime.now());
            evento.setErrorDetalle(null);
            eventoRepository.save(evento);

            return DisponibilidadDespachoResponse.builder()
                    .idEventoDisponibilidad(evento.getIdEventoDisponibilidad())
                    .idRecepcion(evento.getIdRecepcion())
                    .nombreEvento("MercaderiaDisponible")
                    .totalUnidadesDisponibles(totalDisponible)
                    .estadoEnvio("ENVIADO")
                    .messageIdPubsub(messageId)
                    .mensaje("Evento MercaderiaDisponible publicado exitosamente hacia Entregas/Despachos")
                    .fechaRegistro(evento.getFechaEvento())
                    .build();

        } catch (Exception e) {
            evento.setEstadoEnvio("FALLIDO");
            evento.setErrorDetalle(e.getMessage());
            eventoRepository.save(evento);

            return DisponibilidadDespachoResponse.builder()
                    .idEventoDisponibilidad(evento.getIdEventoDisponibilidad())
                    .idRecepcion(evento.getIdRecepcion())
                    .nombreEvento("MercaderiaDisponible")
                    .totalUnidadesDisponibles(totalDisponible)
                    .estadoEnvio("FALLIDO")
                    .messageIdPubsub(null)
                    .mensaje("Evento registrado en base de datos pero falló el envío Pub/Sub a Despachos: " + e.getMessage())
                    .fechaRegistro(evento.getFechaEvento())
                    .build();
        }
    }
}