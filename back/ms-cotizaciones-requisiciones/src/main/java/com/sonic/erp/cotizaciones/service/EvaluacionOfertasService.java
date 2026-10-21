package com.sonic.erp.cotizaciones.service;

import com.sonic.erp.cotizaciones.dto.response.ComparativaOfertasResponse;
import com.sonic.erp.cotizaciones.dto.response.ComparativaOfertasResponse.DetalleComparacionDTO;
import com.sonic.erp.cotizaciones.dto.response.ComparativaOfertasResponse.OfertaComparacionDTO;
import com.sonic.erp.cotizaciones.entity.DetalleOferta;
import com.sonic.erp.cotizaciones.entity.OfertaProveedor;
import com.sonic.erp.cotizaciones.repository.OfertaProveedorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class EvaluacionOfertasService {

    private final OfertaProveedorRepository ofertaProveedorRepository;

    public EvaluacionOfertasService(OfertaProveedorRepository ofertaProveedorRepository) {
        this.ofertaProveedorRepository = ofertaProveedorRepository;
    }

    @Transactional(readOnly = true)
    public ComparativaOfertasResponse compararOfertasPorRequisicion(Long idRequisicion) {
        List<OfertaProveedor> ofertas = ofertaProveedorRepository.findByRequisicionIdConDetalles(idRequisicion);

        Long idSolicitud = (!ofertas.isEmpty() && ofertas.get(0).getSolicitud() != null)
                ? ofertas.get(0).getSolicitud().getIdSolicitud()
                : null;

        return construirComparativa(idSolicitud, idRequisicion, ofertas);
    }

    @Transactional(readOnly = true)
    public ComparativaOfertasResponse compararOfertasPorSolicitud(Long idSolicitud) {
        List<OfertaProveedor> ofertas = ofertaProveedorRepository.findBySolicitudIdConDetalles(idSolicitud);

        Long idRequisicion = (!ofertas.isEmpty() && ofertas.get(0).getSolicitud() != null && ofertas.get(0).getSolicitud().getRequisicion() != null)
                ? ofertas.get(0).getSolicitud().getRequisicion().getIdRequisicion()
                : null;

        return construirComparativa(idSolicitud, idRequisicion, ofertas);
    }

    private ComparativaOfertasResponse construirComparativa(Long idSolicitud, Long idRequisicion, List<OfertaProveedor> ofertas) {
        if (ofertas.isEmpty()) {
            return ComparativaOfertasResponse.builder()
                    .idSolicitud(idSolicitud)
                    .idRequisicion(idRequisicion)
                    .totalOfertas(0)
                    .ofertas(new ArrayList<>())
                    .build();
        }

        List<OfertaComparacionDTO> ofertasDTO = new ArrayList<>();

        for (OfertaProveedor oferta : ofertas) {
            BigDecimal totalOferta = BigDecimal.ZERO;
            int plazoMaximo = 0;
            List<DetalleComparacionDTO> detallesDTO = new ArrayList<>();

            if (oferta.getDetalles() != null) {
                for (DetalleOferta det : oferta.getDetalles()) {
                    BigDecimal precioUnitario = det.getPrecio() != null ? det.getPrecio() : BigDecimal.ZERO;
                    int cantidad = det.getCantidad() != null ? det.getCantidad() : 1;
                    BigDecimal subtotal = precioUnitario.multiply(BigDecimal.valueOf(cantidad));

                    totalOferta = totalOferta.add(subtotal);

                    int plazo = det.getPlazoEntrega() != null ? det.getPlazoEntrega() : 0;
                    if (plazo > plazoMaximo) {
                        plazoMaximo = plazo;
                    }

                    detallesDTO.add(DetalleComparacionDTO.builder()
                            .idDetalle(det.getIdDetalle())
                            .productoId(det.getProductoId())
                            .cantidad(cantidad)
                            .precioUnitario(precioUnitario)
                            .subtotal(subtotal)
                            .plazoEntrega(plazo)
                            .build());
                }
            }

            ofertasDTO.add(OfertaComparacionDTO.builder()
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
        Long mejorPrecioId = ofertasDTO.stream()
                .filter(o -> o.getTotalOferta() != null && o.getTotalOferta().compareTo(BigDecimal.ZERO) > 0)
                .min(Comparator.comparing(OfertaComparacionDTO::getTotalOferta))
                .map(OfertaComparacionDTO::getIdOferta)
                .orElse(null);
        Long menorPlazoId = ofertasDTO.stream()
                .filter(o -> o.getPlazoEntregaMaximoDias() != null && o.getPlazoEntregaMaximoDias() > 0)
                .min(Comparator.comparing(OfertaComparacionDTO::getPlazoEntregaMaximoDias))
                .map(OfertaComparacionDTO::getIdOferta)
                .orElse(null);

        return ComparativaOfertasResponse.builder()
                .idSolicitud(idSolicitud)
                .idRequisicion(idRequisicion)
                .totalOfertas(ofertasDTO.size())
                .mejorPrecioOfertaId(mejorPrecioId)
                .menorPlazoOfertaId(menorPlazoId)
                .ofertas(ofertasDTO)
                .build();
    }
}