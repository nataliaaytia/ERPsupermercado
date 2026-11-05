package com.sonic.erp.ordenesdecompra.service;

import com.sonic.erp.ordenesdecompra.dto.request.RegistrarDevolucionRequest;
import com.sonic.erp.ordenesdecompra.dto.response.DevolucionResponse;
import com.sonic.erp.ordenesdecompra.dto.response.ResolucionDevolucionResponse;
import com.sonic.erp.ordenesdecompra.dto.request.ResolverDevolucionRequest;
import com.sonic.erp.ordenesdecompra.entity.DetalleRecepcion;
import com.sonic.erp.ordenesdecompra.entity.Devolucion;
import com.sonic.erp.ordenesdecompra.repository.DetalleRecepcionRepository;
import com.sonic.erp.ordenesdecompra.repository.DevolucionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DevolucionService {

    private final DevolucionRepository devolucionRepository;
    private final DetalleRecepcionRepository detalleRecepcionRepository;

    public DevolucionService(DevolucionRepository devolucionRepository,
                             DetalleRecepcionRepository detalleRecepcionRepository) {
        this.devolucionRepository = devolucionRepository;
        this.detalleRecepcionRepository = detalleRecepcionRepository;
    }

    @Transactional
    public DevolucionResponse registrarDevolucion(RegistrarDevolucionRequest request) {
        DetalleRecepcion detalle = detalleRecepcionRepository.findById(request.getIdDetalle())
                .orElseThrow(() -> new IllegalArgumentException("No se encontró el detalle de recepción con ID: " + request.getIdDetalle()));
        if (devolucionRepository.existsByDetalleRecepcionIdDetalle(detalle.getIdDetalle())) {
            throw new IllegalArgumentException("Ya existe una devolución registrada para esta línea de recepción");
        }

        int recibida = (detalle.getCantidadRecibida() != null) ? detalle.getCantidadRecibida() : 0;
        int aceptada = (detalle.getCantidadAceptada() != null) ? detalle.getCantidadAceptada() : 0;
        int rechazoDisponible = recibida - aceptada;

        if (rechazoDisponible <= 0) {
            throw new IllegalArgumentException("La línea seleccionada no tiene mercadería rechazada pendiente de devolución");
        }

        if (request.getMotivo() == null || request.getMotivo().trim().isEmpty()) {
            throw new IllegalArgumentException("Es obligatorio especificar el motivo de la devolución");
        }

        Devolucion devolucion = new Devolucion();
        devolucion.setDetalleRecepcion(detalle);
        devolucion.setFecha(LocalDate.now());
        devolucion.setMotivo(request.getMotivo().trim());
        devolucion.setEstado("GENERADA");

        Devolucion guardada = devolucionRepository.save(devolucion);

        DevolucionResponse response = new DevolucionResponse();
        response.setIdDevolucion(guardada.getIdDevolucion());
        response.setIdDetalle(detalle.getIdDetalle());
        if (detalle.getRecepcion() != null) {
            response.setIdRecepcion(detalle.getRecepcion().getIdRecepcion());
        }
        response.setProductoId(detalle.getProductoId());
        response.setCantidadDevuelta(rechazoDisponible);
        response.setMotivo(guardada.getMotivo());
        response.setEstado(guardada.getEstado());
        response.setFecha(guardada.getFecha());

        return response;
    }

    @Transactional(readOnly = true)
    public List<DevolucionResponse> listarPorDetalle(Long idDetalle) {
        return devolucionRepository.findByDetalleRecepcionIdDetalle(idDetalle)
                .stream()
                .map(d -> {
                    DetalleRecepcion det = d.getDetalleRecepcion();
                    int rec = (det.getCantidadRecibida() != null) ? det.getCantidadRecibida() : 0;
                    int ace = (det.getCantidadAceptada() != null) ? det.getCantidadAceptada() : 0;

                    DevolucionResponse res = new DevolucionResponse();
                    res.setIdDevolucion(d.getIdDevolucion());
                    res.setIdDetalle(det.getIdDetalle());
                    if (det.getRecepcion() != null) {
                        res.setIdRecepcion(det.getRecepcion().getIdRecepcion());
                    }
                    res.setProductoId(det.getProductoId());
                    res.setCantidadDevuelta(rec - ace);
                    res.setMotivo(d.getMotivo());
                    res.setEstado(d.getEstado());
                    res.setFecha(d.getFecha());
                    return res;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public ResolucionDevolucionResponse resolverDevolucion(ResolverDevolucionRequest request) {
        Devolucion devolucion = devolucionRepository.findById(request.getIdDevolucion())
                .orElseThrow(() -> new IllegalArgumentException("No se encontró la devolución con ID: " + request.getIdDevolucion()));

        String estadoActual = devolucion.getEstado();

        if ("RETIRADA".equalsIgnoreCase(estadoActual) || "COMPROMISO_REPOSICION".equalsIgnoreCase(estadoActual)) {
            throw new IllegalArgumentException(String.format(
                    "La devolución ya fue resuelta previamente con estado: %s", estadoActual
            ));
        }

        String tipoNorm = request.getTipoResolucion().trim().toUpperCase();
        String nuevoEstado;
        String mensaje;

        if ("RETIRO".equals(tipoNorm)) {
            nuevoEstado = "RETIRADA";
            mensaje = "Mercadería rechazada retirada físicamente por el proveedor. Recepción validada intacta.";
        } else if ("COMPROMISO_REPOSICION".equals(tipoNorm)) {
            nuevoEstado = "COMPROMISO_REPOSICION";
            mensaje = "Compromiso de reposición registrado. La reposición se ingresará como nueva entrega sin modificar la recepción previa.";
        } else {
            throw new IllegalArgumentException("Tipo de resolución inválido. Debe ser 'RETIRO' o 'COMPROMISO_REPOSICION'");
        }

        String motivoActualizado = devolucion.getMotivo();
        if (request.getEvidencia() != null && !request.getEvidencia().trim().isEmpty()) {
            motivoActualizado += " | Respaldo: " + request.getEvidencia().trim();
        }
        if (request.getObservacion() != null && !request.getObservacion().trim().isEmpty()) {
            motivoActualizado += " | Obs: " + request.getObservacion().trim();
        }

        devolucion.setEstado(nuevoEstado);
        devolucion.setMotivo(motivoActualizado);
        Devolucion guardada = devolucionRepository.save(devolucion);

        ResolucionDevolucionResponse response = new ResolucionDevolucionResponse();
        response.setIdDevolucion(guardada.getIdDevolucion());
        response.setIdDetalle(guardada.getDetalleRecepcion().getIdDetalle());
        response.setEstadoAnterior(estadoActual);
        response.setNuevoEstado(guardada.getEstado());
        response.setTipoResolucion(tipoNorm);
        response.setEvidencia(request.getEvidencia());
        response.setMensaje(mensaje);
        response.setFechaResolucion(LocalDate.now());

        return response;
    }
}