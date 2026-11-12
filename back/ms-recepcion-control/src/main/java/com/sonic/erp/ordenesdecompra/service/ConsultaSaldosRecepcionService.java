package com.sonic.erp.ordenesdecompra.service;

import com.sonic.erp.ordenesdecompra.dto.response.SaldoRecepcionOrdenResponse;
import com.sonic.erp.ordenesdecompra.entity.DetalleRecepcion;
import com.sonic.erp.ordenesdecompra.entity.Recepcion;
import com.sonic.erp.ordenesdecompra.repository.RecepcionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ConsultaSaldosRecepcionService {

    private final RecepcionRepository recepcionRepository;

    public ConsultaSaldosRecepcionService(
            RecepcionRepository recepcionRepository) {
        this.recepcionRepository = recepcionRepository;
    }

    @Transactional(readOnly = true)
    public SaldoRecepcionOrdenResponse consultarSaldos(Long idOrden) {
        if (idOrden == null || idOrden <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El identificador de la orden no es válido"
            );
        }

        if (recepcionRepository.existsByIdOrdenIsNull()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Existen recepciones sin orden vinculada"
            );
        }

        Map<Long, Acumulado> acumulados = new HashMap<>();

        List<Recepcion> recepciones =
                recepcionRepository.findByIdOrden(idOrden);

        for (Recepcion recepcion : recepciones) {
            if (recepcion.getDetalles() == null) {
                continue;
            }

            for (DetalleRecepcion detalle : recepcion.getDetalles()) {
                // Una inspección registrada indica que el detalle fue revisado.
                if (detalle.getInspecciones() == null
                        || detalle.getInspecciones().isEmpty()) {
                    continue;
                }

                Long productoId = detalle.getProductoId();
                if (productoId == null) {
                    continue;
                }

                int recibida = detalle.getCantidadRecibida() == null
                        ? 0
                        : detalle.getCantidadRecibida();

                int aceptada = detalle.getCantidadAceptada() == null
                        ? 0
                        : detalle.getCantidadAceptada();

                int rechazada = Math.max(0, recibida - aceptada);

                Acumulado acumulado = acumulados.computeIfAbsent(
                        productoId,
                        id -> new Acumulado()
                );

                acumulado.cantidadAceptada += aceptada;
                acumulado.cantidadRechazada += rechazada;
            }
        }

        List<SaldoRecepcionOrdenResponse.DetalleSaldoResponse> detalles =
                new ArrayList<>();

        acumulados.entrySet().stream()
                .sorted(Map.Entry.comparingByKey(Comparator.naturalOrder()))
                .forEach(entry -> detalles.add(
                        new SaldoRecepcionOrdenResponse.DetalleSaldoResponse(
                                entry.getKey(),
                                entry.getValue().cantidadAceptada,
                                entry.getValue().cantidadRechazada
                        )
                ));

        return new SaldoRecepcionOrdenResponse(idOrden, detalles);
    }

    private static class Acumulado {
        private int cantidadAceptada;
        private int cantidadRechazada;
    }
}