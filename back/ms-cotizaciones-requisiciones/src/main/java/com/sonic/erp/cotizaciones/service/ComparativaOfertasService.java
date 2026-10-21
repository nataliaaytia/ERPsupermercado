package com.sonic.erp.cotizaciones.service;

import com.sonic.erp.cotizaciones.dto.response.ComparativaOfertasResponse;
import com.sonic.erp.cotizaciones.dto.response.ComparativaOfertasResponse.DetalleComparacionDTO;
import com.sonic.erp.cotizaciones.dto.response.ComparativaOfertasResponse.OfertaComparacionDTO;
import com.sonic.erp.cotizaciones.entity.DetalleOferta;
import com.sonic.erp.cotizaciones.entity.OfertaProveedor;
import com.sonic.erp.cotizaciones.entity.SolicitudCotizacion;
import com.sonic.erp.cotizaciones.repository.OfertaProveedorRepository;
import com.sonic.erp.cotizaciones.repository.SolicitudCotizacionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class ComparativaOfertasService {

    private final OfertaProveedorRepository ofertaRepository;
    private final SolicitudCotizacionRepository solicitudRepository;

    public ComparativaOfertasService(
            OfertaProveedorRepository ofertaRepository,
            SolicitudCotizacionRepository solicitudRepository) {
        this.ofertaRepository = ofertaRepository;
        this.solicitudRepository = solicitudRepository;
    }

    @Transactional(readOnly = true)
    public ComparativaOfertasResponse compararPorSolicitud(Long idSolicitud) {
        SolicitudCotizacion solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La solicitud de cotización con ID " + idSolicitud + " no existe"
                ));

        List<OfertaProveedor> ofertas = ofertaRepository.findBySolicitudIdConDetalles(idSolicitud);
        return construirComparativa(solicitud, ofertas);
    }

    @Transactional(readOnly = true)
    public ComparativaOfertasResponse compararPorRequisicion(Long idRequisicion) {
        List<OfertaProveedor> ofertas = ofertaRepository.findByRequisicionIdConDetalles(idRequisicion);

        if (ofertas.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "No se encontraron ofertas asociadas a la requisición con ID " + idRequisicion
            );
        }

        SolicitudCotizacion solicitud = ofertas.get(0).getSolicitud();
        return construirComparativa(solicitud, ofertas);
    }

    private ComparativaOfertasResponse construirComparativa(
            SolicitudCotizacion solicitud,
            List<OfertaProveedor> ofertas) {

        Long idRequisicion = solicitud.getRequisicion() != null
                ? solicitud.getRequisicion().getIdRequisicion()
                : null;

        if (ofertas.isEmpty()) {
            return ComparativaOfertasResponse.builder()
                    .idSolicitud(solicitud.getIdSolicitud())
                    .idRequisicion(idRequisicion)
                    .totalOfertas(0)
                    .ofertas(List.of())
                    .build();
        }

        List<OfertaComparacionDTO> listaDTO = new ArrayList<>();

        for (OfertaProveedor oferta : ofertas) {
            BigDecimal totalOferta = BigDecimal.ZERO;
            int plazoMaximo = 0;
            List<DetalleComparacionDTO> detallesDTO = new ArrayList<>();

            for (DetalleOferta det : oferta.getDetalles()) {
                BigDecimal cantidad = det.getCantidad() != null ? BigDecimal.valueOf(det.getCantidad()) : BigDecimal.ZERO;
                BigDecimal precioUnit = det.getPrecio() != null ? det.getPrecio() : BigDecimal.ZERO;
                BigDecimal subtotal = precioUnit.multiply(cantidad);

                totalOferta = totalOferta.add(subtotal);

                if (det.getPlazoEntrega() != null && det.getPlazoEntrega() > plazoMaximo) {
                    plazoMaximo = det.getPlazoEntrega();
                }

                detallesDTO.add(DetalleComparacionDTO.builder()
                        .idDetalle(det.getIdDetalle())
                        .productoId(det.getProductoId())
                        .cantidad(det.getCantidad())
                        .precioUnitario(precioUnit)
                        .subtotal(subtotal)
                        .plazoEntrega(det.getPlazoEntrega())
                        .build());
            }

            listaDTO.add(OfertaComparacionDTO.builder()
                    .idOferta(oferta.getIdOferta())
                    .proveedorId(oferta.getProveedorId())
                    .fecha(oferta.getFecha())
                    .validez(oferta.getValidez())
                    .estado(oferta.getEstado())
                    .totalOferta(totalOferta)
                    .plazoEntregaMaximoDias(plazoMaximo)
                    .detalles(detallesDTO)
                    .build());
        }

        Long idMejorPrecio = listaDTO.stream()
                .min(Comparator.comparing(OfertaComparacionDTO::getTotalOferta))
                .map(OfertaComparacionDTO::getIdOferta)
                .orElse(null);

        Long idMenorPlazo = listaDTO.stream()
                .min(Comparator.comparing(OfertaComparacionDTO::getPlazoEntregaMaximoDias))
                .map(OfertaComparacionDTO::getIdOferta)
                .orElse(null);

        return ComparativaOfertasResponse.builder()
                .idSolicitud(solicitud.getIdSolicitud())
                .idRequisicion(idRequisicion)
                .totalOfertas(listaDTO.size())
                .mejorPrecioOfertaId(idMejorPrecio)
                .menorPlazoOfertaId(idMenorPlazo)
                .ofertas(listaDTO)
                .build();
    }
}