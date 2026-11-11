package com.sonic.erp.ordenesdecompra.service;

import com.sonic.erp.ordenesdecompra.dto.response.CierreOrdenCompraResponse;
import com.sonic.erp.ordenesdecompra.entity.HistorialEstadoOrdenCompra;
import com.sonic.erp.ordenesdecompra.entity.OrdenCompra;
import com.sonic.erp.ordenesdecompra.repository.OrdenCompraRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
public class CierreOrdenCompraService {

    private final OrdenCompraRepository ordenCompraRepository;

    public CierreOrdenCompraService(
            OrdenCompraRepository ordenCompraRepository) {
        this.ordenCompraRepository = ordenCompraRepository;
    }

    @Transactional
    public CierreOrdenCompraResponse cerrar(
            Long idOrden,
            String responsable) {

        if (idOrden == null || idOrden <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El identificador de la orden no es válido"
            );
        }

        if (responsable == null || responsable.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe indicar el responsable del cierre"
            );
        }

        String responsableLimpio = responsable.trim();

        if (responsableLimpio.length() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El responsable no puede superar 100 caracteres"
            );
        }

        OrdenCompra orden = ordenCompraRepository.findByIdForUpdate(idOrden)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La orden de compra no existe"
                ));

        if (!"ENVIADA".equalsIgnoreCase(orden.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Solo se pueden cerrar órdenes en estado ENVIADA"
            );
        }

        LocalDateTime fechaCierre =
                LocalDateTime.now(ZoneId.of("America/La_Paz"));

        HistorialEstadoOrdenCompra cambio =
                HistorialEstadoOrdenCompra.builder()
                        .estadoAnterior(orden.getEstado())
                        .estadoNuevo("CERRADA")
                        .responsable(responsableLimpio)
                        .fechaCambio(fechaCierre)
                        .observacion(
                                "Cierre coordinado luego de validar recepciones, "
                                        + "discrepancias y devoluciones"
                        )
                        .build();

        orden.agregarCambioEstado(cambio);
        orden.setEstado("CERRADA");

        OrdenCompra guardada =
                ordenCompraRepository.saveAndFlush(orden);

        return new CierreOrdenCompraResponse(
                guardada.getIdOrden(),
                guardada.getNumero(),
                guardada.getEstado(),
                responsableLimpio,
                fechaCierre
        );
    }
}