
package com.sonic.erp.ordenesdecompra.service;

import com.sonic.erp.ordenesdecompra.entity.HistorialEstadoOrdenCompra;
import com.sonic.erp.ordenesdecompra.entity.OrdenCompra;
import com.sonic.erp.ordenesdecompra.repository.OrdenCompraRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
public class HistorialEstadoOrdenCompraService {

    private final OrdenCompraRepository repository;

    public HistorialEstadoOrdenCompraService(
            OrdenCompraRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public ResultadoHistorial consultarHistorial(Long idOrden) {

        if (idOrden == null || idOrden <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El identificador de la orden no es valido"
            );
        }

        OrdenCompra orden = repository.findById(idOrden)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La orden de compra no existe"
                ));

        List<CambioEstado> cambios = orden.getHistorialEstados()
                .stream()
                .sorted(
                        Comparator.comparing(
                                HistorialEstadoOrdenCompra::getFechaCambio
                        ).thenComparing(
                                HistorialEstadoOrdenCompra::getIdHistorial,
                                Comparator.nullsLast(
                                        Comparator.naturalOrder()
                                )
                        )
                )
                .map(cambio -> new CambioEstado(
                        cambio.getIdHistorial(),
                        cambio.getEstadoAnterior(),
                        cambio.getEstadoNuevo(),
                        cambio.getResponsable(),
                        cambio.getFechaCambio(),
                        cambio.getObservacion()
                ))
                .toList();

        return new ResultadoHistorial(
                orden.getIdOrden(),
                orden.getNumero(),
                orden.getEstado(),
                cambios
        );
    }

    public record CambioEstado(
            Long idHistorial,
            String estadoAnterior,
            String estadoNuevo,
            String responsable,
            LocalDateTime fechaCambio,
            String observacion
    ) {
    }

    public record ResultadoHistorial(
            Long idOrden,
            String numero,
            String estadoActual,
            List<CambioEstado> historial
    ) {
    }
}
