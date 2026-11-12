package com.sonic.erp.ordenesdecompra.service;

import com.sonic.erp.ordenesdecompra.dto.response.OrdenCompraSaldosResponse;
import com.sonic.erp.ordenesdecompra.entity.DetalleOrdenCompra;
import com.sonic.erp.ordenesdecompra.entity.OrdenCompra;
import com.sonic.erp.ordenesdecompra.repository.OrdenCompraRepository;
import com.sonic.erp.ordenesdecompra.service.ConsultaRecepcionesOrdenService.DetalleSaldoRecepcion;
import com.sonic.erp.ordenesdecompra.service.ConsultaRecepcionesOrdenService.RespuestaSaldosRecepcion;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ConsultaSaldosOrdenService {

    private final OrdenCompraRepository ordenCompraRepository;
    private final ConsultaRecepcionesOrdenService recepcionesService;

    public ConsultaSaldosOrdenService(
            OrdenCompraRepository ordenCompraRepository,
            ConsultaRecepcionesOrdenService recepcionesService) {
        this.ordenCompraRepository = ordenCompraRepository;
        this.recepcionesService = recepcionesService;
    }

    @Transactional(readOnly = true)
    public OrdenCompraSaldosResponse consultar(Long idOrden) {
        if (idOrden == null || idOrden <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El identificador de la orden no es válido"
            );
        }

        OrdenCompra orden = ordenCompraRepository.findById(idOrden)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La orden de compra no existe"
                ));

        RespuestaSaldosRecepcion respuestaRecepcion =
                recepcionesService.consultarSaldos(idOrden);

        Map<Long, Integer> aceptadasPorProducto = new HashMap<>();
        List<DetalleSaldoRecepcion> detallesRecepcion =
                respuestaRecepcion.detalles();

        for (DetalleSaldoRecepcion detalle : detallesRecepcion) {
            if (detalle == null
                    || detalle.productoId() == null
                    || detalle.cantidadAceptada() == null
                    || detalle.cantidadAceptada() < 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Recepción devolvió una línea de saldo inválida"
                );
            }

            aceptadasPorProducto.merge(
                    detalle.productoId(),
                    detalle.cantidadAceptada(),
                    Integer::sum
            );
        }

        List<OrdenCompraSaldosResponse.DetalleSaldoResponse> detalles =
                orden.getDetalles().stream()
                        .map(detalle -> crearDetalleSaldo(
                                detalle,
                                aceptadasPorProducto.getOrDefault(
                                        detalle.getProductoId(),
                                        0
                                )
                        ))
                        .toList();

        return new OrdenCompraSaldosResponse(
                orden.getIdOrden(),
                orden.getNumero(),
                detalles
        );
    }

    private OrdenCompraSaldosResponse.DetalleSaldoResponse crearDetalleSaldo(
            DetalleOrdenCompra detalle,
            int cantidadAceptada) {

        int cantidadOrdenada = detalle.getCantidad() == null
                ? 0
                : detalle.getCantidad();

        int cantidadPendiente = Math.max(
                0,
                cantidadOrdenada - cantidadAceptada
        );

        return new OrdenCompraSaldosResponse.DetalleSaldoResponse(
                detalle.getIdDetalle(),
                detalle.getProductoId(),
                cantidadOrdenada,
                cantidadAceptada,
                cantidadPendiente
        );
    }
}