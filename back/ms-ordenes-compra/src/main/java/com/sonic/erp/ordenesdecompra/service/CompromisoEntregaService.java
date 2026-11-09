package com.sonic.erp.ordenesdecompra.service;

import com.sonic.erp.ordenesdecompra.dto.request.RegistrarCompromisoEntregaRequest;
import com.sonic.erp.ordenesdecompra.dto.response.CompromisoEntregaResponse;
import com.sonic.erp.ordenesdecompra.entity.CompromisoEntrega;
import com.sonic.erp.ordenesdecompra.entity.DetalleOrdenCompra;
import com.sonic.erp.ordenesdecompra.entity.OrdenCompra;
import com.sonic.erp.ordenesdecompra.repository.CompromisoEntregaRepository;
import com.sonic.erp.ordenesdecompra.repository.OrdenCompraRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.ZoneId;

@Service
public class CompromisoEntregaService {

    private final OrdenCompraRepository ordenCompraRepository;
    private final CompromisoEntregaRepository compromisoEntregaRepository;

    public CompromisoEntregaService(
            OrdenCompraRepository ordenCompraRepository,
            CompromisoEntregaRepository compromisoEntregaRepository) {
        this.ordenCompraRepository = ordenCompraRepository;
        this.compromisoEntregaRepository = compromisoEntregaRepository;
    }

    @Transactional
    public CompromisoEntregaResponse registrar(
            Long idOrden,
            Long idDetalle,
            RegistrarCompromisoEntregaRequest request) {

        if (idOrden == null || idOrden <= 0 ||
                idDetalle == null || idDetalle <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Los identificadores de la orden y del detalle no son válidos");
        }

        if (request == null ||
                request.fechaEntrega() == null ||
                request.cantidad() == null ||
                request.cantidad() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La fecha de entrega y la cantidad deben ser válidas");
        }

        LocalDate hoy = LocalDate.now(ZoneId.of("America/La_Paz"));

        if (request.fechaEntrega().isBefore(hoy)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La fecha de entrega no puede ser anterior a hoy");
        }

        OrdenCompra orden = ordenCompraRepository
                .findByIdForUpdate(idOrden)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La orden de compra no existe"));

        if (!"APROBADA".equalsIgnoreCase(orden.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Solo se pueden registrar compromisos para órdenes aprobadas");
        }

        DetalleOrdenCompra detalle = orden.getDetalles()
                .stream()
                .filter(item -> idDetalle.equals(item.getIdDetalle()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "El detalle no pertenece a la orden indicada"));

        Long cantidadYaComprometida =
                compromisoEntregaRepository
                        .sumarCantidadComprometidaPorDetalle(idDetalle);

        if (cantidadYaComprometida == null) {
            cantidadYaComprometida = 0L;
        }

        long cantidadTotalComprometida =
                cantidadYaComprometida + request.cantidad();

        if (cantidadTotalComprometida > detalle.getCantidad()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La cantidad comprometida supera la cantidad ordenada");
        }

        String observacion = request.observacion();

        if (observacion != null) {
            observacion = observacion.trim();

            if (observacion.isEmpty()) {
                observacion = null;
            }
        }

        CompromisoEntrega compromiso = CompromisoEntrega.builder()
                .detalleOrden(detalle)
                .fechaEntrega(request.fechaEntrega())
                .cantidad(request.cantidad())
                .estado("PROGRAMADO")
                .observacion(observacion)
                .build();

        CompromisoEntrega guardado =
                compromisoEntregaRepository.saveAndFlush(compromiso);

        return new CompromisoEntregaResponse(
                guardado.getIdCompromiso(),
                orden.getIdOrden(),
                detalle.getIdDetalle(),
                detalle.getProductoId(),
                guardado.getFechaEntrega(),
                guardado.getCantidad(),
                guardado.getEstado(),
                guardado.getObservacion()
        );
    }
}