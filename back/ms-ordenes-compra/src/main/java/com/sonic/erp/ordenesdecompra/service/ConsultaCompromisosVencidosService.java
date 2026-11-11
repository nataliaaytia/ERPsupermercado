package com.sonic.erp.ordenesdecompra.service;

import com.sonic.erp.ordenesdecompra.dto.response.CompromisoVencidoResponse;
import com.sonic.erp.ordenesdecompra.entity.CompromisoEntrega;
import com.sonic.erp.ordenesdecompra.repository.CompromisoEntregaRepository;
import com.sonic.erp.ordenesdecompra.service.ConsultaRecepcionesOrdenService.DetalleSaldoRecepcion;
import com.sonic.erp.ordenesdecompra.service.ConsultaRecepcionesOrdenService.RespuestaSaldosRecepcion;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class ConsultaCompromisosVencidosService {

    private final CompromisoEntregaRepository compromisoRepository;
    private final ConsultaRecepcionesOrdenService recepcionesService;

    public ConsultaCompromisosVencidosService(
            CompromisoEntregaRepository compromisoRepository,
            ConsultaRecepcionesOrdenService recepcionesService) {
        this.compromisoRepository = compromisoRepository;
        this.recepcionesService = recepcionesService;
    }

    @Transactional(readOnly = true)
    public List<CompromisoVencidoResponse> consultarVencidos() {
        LocalDate hoy = LocalDate.now(
                ZoneId.of("America/La_Paz")
        );

        List<CompromisoEntrega> compromisos =
                compromisoRepository.buscarProgramadosDeOrdenesVigentes();

        Set<Long> ordenesNecesarias = new HashSet<>();

        for (CompromisoEntrega compromiso : compromisos) {
            if (compromiso.getFechaEntrega() != null
                    && compromiso.getFechaEntrega().isBefore(hoy)) {
                ordenesNecesarias.add(
                        compromiso.getDetalleOrden()
                                .getOrdenCompra()
                                .getIdOrden()
                );
            }
        }

        Map<Long, Map<Long, Integer>> aceptadasRestantesPorOrden =
                new HashMap<>();

        for (Long idOrden : ordenesNecesarias) {
            RespuestaSaldosRecepcion respuesta =
                    recepcionesService.consultarSaldos(idOrden);

            Map<Long, Integer> aceptadasPorProducto = new HashMap<>();

            for (DetalleSaldoRecepcion detalle : respuesta.detalles()) {
                if (detalle == null
                        || detalle.productoId() == null
                        || detalle.cantidadAceptada() == null
                        || detalle.cantidadAceptada() < 0) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_GATEWAY,
                            "Recepción devolvió cantidades aceptadas inválidas"
                    );
                }

                aceptadasPorProducto.merge(
                        detalle.productoId(),
                        detalle.cantidadAceptada(),
                        Integer::sum
                );
            }

            aceptadasRestantesPorOrden.put(
                    idOrden,
                    aceptadasPorProducto
            );
        }

        List<CompromisoVencidoResponse> resultado =
                new ArrayList<>();

        for (CompromisoEntrega compromiso : compromisos) {
            if (compromiso.getFechaEntrega() == null
                    || !compromiso.getFechaEntrega().isBefore(hoy)) {
                continue;
            }

            var detalleOrden = compromiso.getDetalleOrden();
            var orden = detalleOrden.getOrdenCompra();

            Map<Long, Integer> aceptadasRestantes =
                    aceptadasRestantesPorOrden.getOrDefault(
                            orden.getIdOrden(),
                            Map.of()
                    );

            int cantidadAceptadaRestante =
                    aceptadasRestantes.getOrDefault(
                            detalleOrden.getProductoId(),
                            0
                    );

            int cantidadComprometida = compromiso.getCantidad() == null
                    ? 0
                    : compromiso.getCantidad();

            int cantidadAplicada = Math.min(
                    cantidadComprometida,
                    cantidadAceptadaRestante
            );

            int cantidadPendiente =
                    cantidadComprometida - cantidadAplicada;

            if (cantidadAceptadaRestante > 0
                    && aceptadasRestantes instanceof HashMap<?, ?>) {
                aceptadasRestantes.put(
                        detalleOrden.getProductoId(),
                        cantidadAceptadaRestante - cantidadAplicada
                );
            }

            if (cantidadPendiente > 0) {
                resultado.add(
                        new CompromisoVencidoResponse(
                                compromiso.getIdCompromiso(),
                                orden.getIdOrden(),
                                orden.getNumero(),
                                orden.getProveedorId(),
                                detalleOrden.getIdDetalle(),
                                detalleOrden.getProductoId(),
                                compromiso.getFechaEntrega(),
                                cantidadPendiente
                        )
                );
            }
        }

        return resultado;
    }
}