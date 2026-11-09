package com.sonic.erp.ordenesdecompra.service;

import com.sonic.erp.ordenesdecompra.dto.request.ConfirmarOrdenContabilidadRequest;
import com.sonic.erp.ordenesdecompra.dto.response.CompromisoContableResponse;
import com.sonic.erp.ordenesdecompra.dto.response.EventoContabilidadPubSubPayload;
import com.sonic.erp.ordenesdecompra.entity.CompromisoContable;
import com.sonic.erp.ordenesdecompra.repository.CompromisoContableRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class CompromisoContableService {

    private final CompromisoContableRepository compromisoRepository;
    private final PubSubContabilidadService pubSubService;

    public CompromisoContableService(CompromisoContableRepository compromisoRepository,
                                     PubSubContabilidadService pubSubService) {
        this.compromisoRepository = compromisoRepository;
        this.pubSubService = pubSubService;
    }

    @Transactional
    public CompromisoContableResponse registrarYPublicarCompromiso(ConfirmarOrdenContabilidadRequest request) {
        String estado = request.getEstadoOrden().trim().toUpperCase();
        if (!"APROBADA".equals(estado) && !"CONFIRMADA_PROVEEDOR".equals(estado) && !"CONFIRMADA".equals(estado)) {
            throw new IllegalArgumentException("La orden debe estar aprobada o confirmada por el proveedor para generar el compromiso contable. Estado actual: " + request.getEstadoOrden());
        }

        compromisoRepository.findByIdOrden(request.getIdOrden()).ifPresent(c -> {
            if ("ENVIADO".equalsIgnoreCase(c.getEstadoEnvio())) {
                throw new IllegalArgumentException("La orden ID " + request.getIdOrden() + " ya tiene un compromiso contable enviado previamente (MessageID: " + c.getMessageIdPubsub() + ")");
            }
        });

        CompromisoContable compromiso = compromisoRepository.findByIdOrden(request.getIdOrden())
                .orElse(new CompromisoContable());

        compromiso.setIdOrden(request.getIdOrden());
        compromiso.setNumeroOrden(request.getNumeroOrden());
        compromiso.setProveedorId(request.getProveedorId());
        compromiso.setMontoTotal(request.getMontoTotal());
        compromiso.setFechaEvento(LocalDateTime.now());
        compromiso.setEstadoEnvio("PENDIENTE");
        compromiso = compromisoRepository.save(compromiso);

        EventoContabilidadPubSubPayload payload = new EventoContabilidadPubSubPayload();
        payload.setEvento("ORDEN_COMPRA_CONFIRMADA");
        payload.setIdOrden(request.getIdOrden());
        payload.setNumeroOrden(request.getNumeroOrden());
        payload.setProveedorId(request.getProveedorId());
        payload.setMontoTotal(request.getMontoTotal());
        payload.setMoneda("BOB");
        payload.setFechaConfirmacion(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        payload.setDetalles(request.getDetalles());

        try {
            String messageId = pubSubService.publicarCompromisoContable(payload);
            compromiso.setEstadoEnvio("ENVIADO");
            compromiso.setMessageIdPubsub(messageId);
            compromiso.setFechaEnvio(LocalDateTime.now());
            compromiso.setErrorDetalle(null);
            compromisoRepository.save(compromiso);

            return CompromisoContableResponse.builder()
                    .idCompromiso(compromiso.getIdCompromiso())
                    .idOrden(compromiso.getIdOrden())
                    .numeroOrden(compromiso.getNumeroOrden())
                    .montoTotal(compromiso.getMontoTotal())
                    .estadoEnvio("ENVIADO")
                    .messageIdPubsub(messageId)
                    .mensaje("Compromiso registrado y publicado exitosamente hacia Contabilidad mediante Pub/Sub")
                    .fechaRegistro(compromiso.getFechaEvento())
                    .build();

        } catch (Exception e) {
            compromiso.setEstadoEnvio("FALLIDO");
            compromiso.setErrorDetalle(e.getMessage());
            compromisoRepository.save(compromiso);

            return CompromisoContableResponse.builder()
                    .idCompromiso(compromiso.getIdCompromiso())
                    .idOrden(compromiso.getIdOrden())
                    .numeroOrden(compromiso.getNumeroOrden())
                    .montoTotal(compromiso.getMontoTotal())
                    .estadoEnvio("FALLIDO")
                    .messageIdPubsub(null)
                    .mensaje("Compromiso registrado en BD pero falló la publicación en Pub/Sub: " + e.getMessage())
                    .fechaRegistro(compromiso.getFechaEvento())
                    .build();
        }
    }
}