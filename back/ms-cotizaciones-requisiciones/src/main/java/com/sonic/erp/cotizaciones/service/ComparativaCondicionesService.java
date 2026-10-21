package com.sonic.erp.cotizaciones.service;

import com.sonic.erp.cotizaciones.dto.response.ComparativaCondicionesEntregaResponse;
import com.sonic.erp.cotizaciones.dto.response.ComparativaCondicionesEntregaResponse.CondicionOfertaDTO;
import com.sonic.erp.cotizaciones.dto.response.ComparativaCondicionesEntregaResponse.DetallePlazoDTO;
import com.sonic.erp.cotizaciones.entity.DetalleOferta;
import com.sonic.erp.cotizaciones.entity.OfertaProveedor;
import com.sonic.erp.cotizaciones.entity.SolicitudCotizacion;
import com.sonic.erp.cotizaciones.repository.OfertaProveedorRepository;
import com.sonic.erp.cotizaciones.repository.SolicitudCotizacionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class ComparativaCondicionesService {

    private final OfertaProveedorRepository ofertaRepository;
    private final SolicitudCotizacionRepository solicitudRepository;

    public ComparativaCondicionesService(
            OfertaProveedorRepository ofertaRepository,
            SolicitudCotizacionRepository solicitudRepository) {
        this.ofertaRepository = ofertaRepository;
        this.solicitudRepository = solicitudRepository;
    }

    @Transactional(readOnly = true)
    public ComparativaCondicionesEntregaResponse compararCondicionesPorSolicitud(Long idSolicitud) {
        SolicitudCotizacion solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La solicitud de cotización con ID " + idSolicitud + " no existe"
                ));

        List<OfertaProveedor> ofertas = ofertaRepository.findBySolicitudIdConDetalles(idSolicitud);
        return construirComparativaCondiciones(solicitud, ofertas);
    }

    @Transactional(readOnly = true)
    public ComparativaCondicionesEntregaResponse compararCondicionesPorRequisicion(Long idRequisicion) {
        List<OfertaProveedor> ofertas = ofertaRepository.findByRequisicionIdConDetalles(idRequisicion);

        if (ofertas.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "No se encontraron ofertas para la requisición con ID " + idRequisicion
            );
        }

        SolicitudCotizacion solicitud = ofertas.get(0).getSolicitud();
        return construirComparativaCondiciones(solicitud, ofertas);
    }

    private ComparativaCondicionesEntregaResponse construirComparativaCondiciones(
            SolicitudCotizacion solicitud,
            List<OfertaProveedor> ofertas) {

        Long idRequisicion = solicitud.getRequisicion() != null
                ? solicitud.getRequisicion().getIdRequisicion()
                : null;

        if (ofertas.isEmpty()) {
            return ComparativaCondicionesEntregaResponse.builder()
                    .idSolicitud(solicitud.getIdSolicitud())
                    .idRequisicion(idRequisicion)
                    .totalOfertas(0)
                    .ofertas(List.of())
                    .build();
        }

        List<CondicionOfertaDTO> listaCondiciones = new ArrayList<>();

        for (OfertaProveedor oferta : ofertas) {
            LocalDate fechaBase = oferta.getFecha() != null ? oferta.getFecha() : LocalDate.now();
            int plazoMin = Integer.MAX_VALUE;
            int plazoMax = 0;
            List<DetallePlazoDTO> detallesDTO = new ArrayList<>();

            for (DetalleOferta det : oferta.getDetalles()) {
                int plazo = det.getPlazoEntrega() != null ? det.getPlazoEntrega() : 0;

                if (plazo < plazoMin) {
                    plazoMin = plazo;
                }
                if (plazo > plazoMax) {
                    plazoMax = plazo;
                }

                detallesDTO.add(DetallePlazoDTO.builder()
                        .idDetalle(det.getIdDetalle())
                        .productoId(det.getProductoId())
                        .cantidad(det.getCantidad())
                        .plazoEntregaDias(plazo)
                        .fechaEstimadaEntrega(fechaBase.plusDays(plazo))
                        .build());
            }

            if (plazoMin == Integer.MAX_VALUE) {
                plazoMin = 0;
            }

            listaCondiciones.add(CondicionOfertaDTO.builder()
                    .idOferta(oferta.getIdOferta())
                    .proveedorId(oferta.getProveedorId())
                    .fechaOferta(oferta.getFecha())
                    .validezOferta(oferta.getValidez())
                    .estado(oferta.getEstado())
                    .plazoMinimoDias(plazoMin)
                    .plazoMaximoDias(plazoMax)
                    .fechaEstimadaEntregaMaxima(fechaBase.plusDays(plazoMax))
                    .plazosPorProducto(detallesDTO)
                    .build());
        }

        // Proveedor con el menor plazo máximo de entrega
        CondicionOfertaDTO mejorOfertaTiempo = listaCondiciones.stream()
                .min(Comparator.comparing(CondicionOfertaDTO::getPlazoMaximoDias))
                .orElse(null);

        Long mejorProveedorId = mejorOfertaTiempo != null ? mejorOfertaTiempo.getProveedorId() : null;
        Integer menorPlazoGlobal = mejorOfertaTiempo != null ? mejorOfertaTiempo.getPlazoMaximoDias() : null;

        return ComparativaCondicionesEntregaResponse.builder()
                .idSolicitud(solicitud.getIdSolicitud())
                .idRequisicion(idRequisicion)
                .totalOfertas(listaCondiciones.size())
                .proveedorMasRapidoId(mejorProveedorId)
                .menorPlazoGlobalDias(menorPlazoGlobal)
                .ofertas(listaCondiciones)
                .build();
    }
}