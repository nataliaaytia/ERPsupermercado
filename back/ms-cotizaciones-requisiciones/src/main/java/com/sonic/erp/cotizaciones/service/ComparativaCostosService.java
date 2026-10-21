package com.sonic.erp.cotizaciones.service;

import com.sonic.erp.cotizaciones.dto.response.ComparativaCostosResponse;
import com.sonic.erp.cotizaciones.dto.response.ComparativaCostosResponse.CostoDetalleDTO;
import com.sonic.erp.cotizaciones.dto.response.ComparativaCostosResponse.CostoOfertaDTO;
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
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class ComparativaCostosService {

    private final OfertaProveedorRepository ofertaRepository;
    private final SolicitudCotizacionRepository solicitudRepository;

    public ComparativaCostosService(
            OfertaProveedorRepository ofertaRepository,
            SolicitudCotizacionRepository solicitudRepository) {
        this.ofertaRepository = ofertaRepository;
        this.solicitudRepository = solicitudRepository;
    }

    @Transactional(readOnly = true)
    public ComparativaCostosResponse calcularCostosPorSolicitud(Long idSolicitud, String orden) {
        SolicitudCotizacion solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La solicitud de cotización con ID " + idSolicitud + " no existe"
                ));

        List<OfertaProveedor> todasLasOfertas = ofertaRepository.findBySolicitudIdConDetalles(idSolicitud);
        LocalDate hoy = LocalDate.now();
        List<OfertaProveedor> ofertasValidas = todasLasOfertas.stream()
                .filter(o -> !"RECHAZADA".equalsIgnoreCase(o.getEstado()))
                .filter(o -> o.getValidez() == null || !o.getValidez().isBefore(hoy))
                .toList();

        return procesarCalculos(solicitud, ofertasValidas, orden);
    }

    private ComparativaCostosResponse procesarCalculos(
            SolicitudCotizacion solicitud,
            List<OfertaProveedor> ofertas,
            String orden) {

        Long idRequisicion = solicitud.getRequisicion() != null
                ? solicitud.getRequisicion().getIdRequisicion()
                : null;

        if (ofertas.isEmpty()) {
            return ComparativaCostosResponse.builder()
                    .idSolicitud(solicitud.getIdSolicitud())
                    .idRequisicion(idRequisicion)
                    .totalPropuestasValidas(0)
                    .menorCostoTotal(BigDecimal.ZERO)
                    .mayorCostoTotal(BigDecimal.ZERO)
                    .costoPromedio(BigDecimal.ZERO)
                    .propuestas(List.of())
                    .build();
        }

        List<CostoOfertaDTO> listaCalculada = new ArrayList<>();
        BigDecimal sumaCostosGlobales = BigDecimal.ZERO;

        for (OfertaProveedor oferta : ofertas) {
            BigDecimal totalPropuesta = BigDecimal.ZERO;
            List<CostoDetalleDTO> desglose = new ArrayList<>();

            for (DetalleOferta det : oferta.getDetalles()) {
                BigDecimal cantidad = det.getCantidad() != null
                        ? BigDecimal.valueOf(det.getCantidad())
                        : BigDecimal.ZERO;
                BigDecimal precioUnit = det.getPrecio() != null
                        ? det.getPrecio()
                        : BigDecimal.ZERO;

                BigDecimal subtotal = precioUnit.multiply(cantidad).setScale(2, RoundingMode.HALF_UP);
                totalPropuesta = totalPropuesta.add(subtotal);

                desglose.add(CostoDetalleDTO.builder()
                        .idDetalle(det.getIdDetalle())
                        .productoId(det.getProductoId())
                        .cantidad(det.getCantidad())
                        .precioUnitario(precioUnit)
                        .subtotal(subtotal)
                        .build());
            }

            sumaCostosGlobales = sumaCostosGlobales.add(totalPropuesta);

            listaCalculada.add(CostoOfertaDTO.builder()
                    .idOferta(oferta.getIdOferta())
                    .proveedorId(oferta.getProveedorId())
                    .fecha(oferta.getFecha())
                    .validez(oferta.getValidez())
                    .estado(oferta.getEstado())
                    .costoTotal(totalPropuesta)
                    .totalItemsCotizados(desglose.size())
                    .desgloseItems(desglose)
                    .build());
        }

        CostoOfertaDTO minOferta = listaCalculada.stream()
                .min(Comparator.comparing(CostoOfertaDTO::getCostoTotal))
                .orElse(null);

        CostoOfertaDTO maxOferta = listaCalculada.stream()
                .max(Comparator.comparing(CostoOfertaDTO::getCostoTotal))
                .orElse(null);

        BigDecimal menorCosto = minOferta != null ? minOferta.getCostoTotal() : BigDecimal.ZERO;
        BigDecimal mayorCosto = maxOferta != null ? maxOferta.getCostoTotal() : BigDecimal.ZERO;

        BigDecimal promedio = sumaCostosGlobales.divide(
                BigDecimal.valueOf(listaCalculada.size()), 2, RoundingMode.HALF_UP
        );

        for (CostoOfertaDTO propuesta : listaCalculada) {
            BigDecimal diferencia = propuesta.getCostoTotal().subtract(menorCosto);
            propuesta.setDiferenciaConMenorCosto(diferencia);

            if (menorCosto.compareTo(BigDecimal.ZERO) > 0) {
                double porcentaje = diferencia.divide(menorCosto, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .doubleValue();
                propuesta.setPorcentajeVariacion(porcentaje);
            } else {
                propuesta.setPorcentajeVariacion(0.0);
            }
        }

        if ("desc".equalsIgnoreCase(orden)) {
            listaCalculada.sort(Comparator.comparing(CostoOfertaDTO::getCostoTotal).reversed());
        } else {
            listaCalculada.sort(Comparator.comparing(CostoOfertaDTO::getCostoTotal));
        }

        return ComparativaCostosResponse.builder()
                .idSolicitud(solicitud.getIdSolicitud())
                .idRequisicion(idRequisicion)
                .totalPropuestasValidas(listaCalculada.size())
                .ofertaMasEconomicaId(minOferta != null ? minOferta.getIdOferta() : null)
                .menorCostoTotal(menorCosto)
                .ofertaMasCostosaId(maxOferta != null ? maxOferta.getIdOferta() : null)
                .mayorCostoTotal(mayorCosto)
                .costoPromedio(promedio)
                .propuestas(listaCalculada)
                .build();
    }
}