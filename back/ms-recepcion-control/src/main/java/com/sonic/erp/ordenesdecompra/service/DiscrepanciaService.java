package com.sonic.erp.ordenesdecompra.service;

import com.sonic.erp.ordenesdecompra.dto.request.RegistrarDiscrepanciaRequest;
import com.sonic.erp.ordenesdecompra.dto.response.DiscrepanciaResponse;
import com.sonic.erp.ordenesdecompra.entity.DetalleRecepcion;
import com.sonic.erp.ordenesdecompra.entity.Discrepancia;
import com.sonic.erp.ordenesdecompra.repository.DetalleRecepcionRepository;
import com.sonic.erp.ordenesdecompra.repository.DiscrepanciaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DiscrepanciaService {

    private final DetalleRecepcionRepository detalleRecepcionRepository;
    private final DiscrepanciaRepository discrepanciaRepository;

    public DiscrepanciaService(DetalleRecepcionRepository detalleRecepcionRepository,
                               DiscrepanciaRepository discrepanciaRepository) {
        this.detalleRecepcionRepository = detalleRecepcionRepository;
        this.discrepanciaRepository = discrepanciaRepository;
    }

    @Transactional
    public DiscrepanciaResponse registrarDiscrepancia(RegistrarDiscrepanciaRequest request) {
        DetalleRecepcion detalle = detalleRecepcionRepository.findById(request.getIdDetalle())
                .orElseThrow(() -> new IllegalArgumentException("No se encontró el detalle de recepción con ID: " + request.getIdDetalle()));

        if (request.getCantidad() == null || request.getCantidad() <= 0) {
            throw new IllegalArgumentException("La cantidad en discrepancia debe ser mayor a 0");
        }

        if (request.getMotivo() == null || request.getMotivo().trim().isEmpty()) {
            throw new IllegalArgumentException("La descripción o motivo de la discrepancia no puede estar vacía");
        }

        String tipoNorm = request.getTipoDiferencia().trim().toUpperCase();
        String estadoInicial;
        if ("EXCESO".equals(tipoNorm)) {
            estadoInicial = "PENDIENTE_RESOLUCION";
        } else {
            estadoInicial = "REGISTRADA";
        }

        Discrepancia discrepancia = new Discrepancia();
        discrepancia.setDetalleRecepcion(detalle);
        discrepancia.setTipoDiferencia(tipoNorm);
        discrepancia.setCantidad(request.getCantidad());
        discrepancia.setMotivo(request.getMotivo().trim());
        discrepancia.setEstado(estadoInicial);
        discrepancia.setFecha(LocalDate.now());

        Discrepancia guardada = discrepanciaRepository.save(discrepancia);

        return mapearResponse(guardada);
    }

    @Transactional(readOnly = true)
    public List<DiscrepanciaResponse> listarPorDetalle(Long idDetalle) {
        return discrepanciaRepository.findByDetalleRecepcionIdDetalle(idDetalle)
                .stream()
                .map(this::mapearResponse)
                .collect(Collectors.toList());
    }

    private DiscrepanciaResponse mapearResponse(Discrepancia d) {
        DiscrepanciaResponse res = new DiscrepanciaResponse();
        res.setIdDiscrepancia(d.getIdDiscrepancia());
        res.setIdDetalle(d.getDetalleRecepcion().getIdDetalle());
        res.setTipoDiferencia(d.getTipoDiferencia());
        res.setCantidad(d.getCantidad());
        res.setMotivo(d.getMotivo());
        res.setEstado(d.getEstado());
        res.setFecha(d.getFecha());
        return res;
    }
}