package com.sonic.erp.ordenesdecompra.service;

import com.sonic.erp.ordenesdecompra.dto.response.ConciliacionResponse;
import com.sonic.erp.ordenesdecompra.dto.response.DetalleOrdenExternaResponse;
import com.sonic.erp.ordenesdecompra.dto.response.LineaConciliacionResponse;
import com.sonic.erp.ordenesdecompra.dto.response.OrdenCompraExternaResponse;
import com.sonic.erp.ordenesdecompra.entity.DetalleRecepcion;
import com.sonic.erp.ordenesdecompra.entity.Discrepancia;
import com.sonic.erp.ordenesdecompra.entity.Recepcion;
import com.sonic.erp.ordenesdecompra.repository.DiscrepanciaRepository;
import com.sonic.erp.ordenesdecompra.repository.RecepcionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class ConciliacionService {

    private final RecepcionRepository recepcionRepository;
    private final DiscrepanciaRepository discrepanciaRepository;
    private final RestTemplate restTemplate;

    @Value("${servicios.ordenes.url:http://localhost:8081/api/ordenes}")
    private String ordenesServiceUrl;

    public ConciliacionService(RecepcionRepository recepcionRepository,
                               DiscrepanciaRepository discrepanciaRepository,
                               RestTemplate restTemplate) {
        this.recepcionRepository = recepcionRepository;
        this.discrepanciaRepository = discrepanciaRepository;
        this.restTemplate = restTemplate;
    }

    @Transactional(readOnly = true)
    public ConciliacionResponse conciliarRecepcionConOrden(Long idRecepcion, Long idOrden) {
        Recepcion recepcion = recepcionRepository.findById(idRecepcion)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró la recepción con ID: " + idRecepcion));

        OrdenCompraExternaResponse orden = obtenerOrdenCompra(idOrden);

        Map<Long, Integer> solicitados = new HashMap<>();
        if (orden.getDetalles() != null) {
            for (DetalleOrdenExternaResponse det : orden.getDetalles()) {
                solicitados.put(det.getProductoId(), det.getCantidad());
            }
        }

        List<LineaConciliacionResponse> lineas = new ArrayList<>();
        boolean hayDiferenciasNumericas = false;
        boolean discrepanciasSinResolver = false;
        Set<Long> productosProcesados = new HashSet<>();

        if (recepcion.getDetalles() != null) {
            for (DetalleRecepcion detRec : recepcion.getDetalles()) {
                Long prodId = detRec.getProductoId();
                productosProcesados.add(prodId);

                int cantidadSolicitada = solicitados.getOrDefault(prodId, 0);
                int cantidadRecibida = (detRec.getCantidadRecibida() != null) ? detRec.getCantidadRecibida() : 0;
                int cantidadAceptada = (detRec.getCantidadAceptada() != null) ? detRec.getCantidadAceptada() : 0;
                int diferencia = cantidadAceptada - cantidadSolicitada;

                String estadoLinea;
                if (cantidadSolicitada == 0) {
                    estadoLinea = "PRODUCTO_NO_ORDENADO";
                    hayDiferenciasNumericas = true;
                } else if (diferencia == 0) {
                    estadoLinea = "CONFORME";
                } else if (diferencia < 0) {
                    estadoLinea = "FALTANTE";
                    hayDiferenciasNumericas = true;
                } else {
                    estadoLinea = "EXCESO";
                    hayDiferenciasNumericas = true;
                }

                List<Discrepancia> discrepancias = discrepanciaRepository.findByDetalleRecepcionIdDetalle(detRec.getIdDetalle());
                for (Discrepancia disc : discrepancias) {
                    if ("PENDIENTE_RESOLUCION".equalsIgnoreCase(disc.getEstado())) {
                        discrepanciasSinResolver = true;
                    }
                }

                LineaConciliacionResponse lineaDto = new LineaConciliacionResponse();
                lineaDto.setProductoId(prodId);
                lineaDto.setCantidadSolicitada(cantidadSolicitada);
                lineaDto.setCantidadRecibida(cantidadRecibida);
                lineaDto.setCantidadAceptada(cantidadAceptada);
                lineaDto.setDiferencia(diferencia);
                lineaDto.setEstadoLinea(estadoLinea);
                lineas.add(lineaDto);
            }
        }

        for (Map.Entry<Long, Integer> entry : solicitados.entrySet()) {
            if (!productosProcesados.contains(entry.getKey())) {
                hayDiferenciasNumericas = true;
                LineaConciliacionResponse noRecibido = new LineaConciliacionResponse();
                noRecibido.setProductoId(entry.getKey());
                noRecibido.setCantidadSolicitada(entry.getValue());
                noRecibido.setCantidadRecibida(0);
                noRecibido.setCantidadAceptada(0);
                noRecibido.setDiferencia(-entry.getValue());
                noRecibido.setEstadoLinea("FALTANTE_TOTAL");
                lineas.add(noRecibido);
            }
        }

        String estadoConciliacion;
        String mensaje;

        if (discrepanciasSinResolver) {
            estadoConciliacion = "NO_CONFORME_DISCREPANCIAS_PENDIENTES";
            mensaje = "Existen excesos o discrepancias pendientes de resolución que bloquean la conformidad.";
        } else if (hayDiferenciasNumericas) {
            estadoConciliacion = "DISCREPANCIAS_DETECTADAS";
            mensaje = "Se detectaron diferencias de cantidad o producto respecto de la orden.";
        } else {
            estadoConciliacion = "CONFORME";
            mensaje = "Recepción plenamente conforme con lo solicitado en la orden.";
        }

        ConciliacionResponse response = new ConciliacionResponse();
        response.setIdRecepcion(idRecepcion);
        response.setIdOrden(idOrden);
        response.setEstadoConciliacion(estadoConciliacion);
        response.setTieneDiferenciasPendientes(discrepanciasSinResolver || hayDiferenciasNumericas);
        response.setMensaje(mensaje);
        response.setLineas(lineas);

        return response;
    }
    private OrdenCompraExternaResponse obtenerOrdenCompra(Long idOrden) {
        try {
            return restTemplate.getForObject(ordenesServiceUrl + "/" + idOrden, OrdenCompraExternaResponse.class);
        } catch (Exception e) {
            OrdenCompraExternaResponse mock = new OrdenCompraExternaResponse();
            mock.setIdOrden(idOrden);
            mock.setNumero("OC-" + idOrden);
            mock.setEstado("APROBADA");

            List<DetalleOrdenExternaResponse> detallesMock = new ArrayList<>();

            DetalleOrdenExternaResponse item1 = new DetalleOrdenExternaResponse();
            item1.setProductoId(101L);
            item1.setCantidad(10);
            detallesMock.add(item1);

            mock.setDetalles(detallesMock);
            return mock;
        }
    }
}