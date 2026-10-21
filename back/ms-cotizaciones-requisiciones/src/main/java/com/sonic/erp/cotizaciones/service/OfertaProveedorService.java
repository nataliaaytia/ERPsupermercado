
package com.sonic.erp.cotizaciones.service;

import com.sonic.erp.cotizaciones.dto.request.DetalleOfertaRequest;
import com.sonic.erp.cotizaciones.dto.request.RegistrarOfertaRequest;
import com.sonic.erp.cotizaciones.dto.request.ActualizarOfertaRequest;
import com.sonic.erp.cotizaciones.entity.DetalleOferta;
import com.sonic.erp.cotizaciones.entity.OfertaProveedor;
import com.sonic.erp.cotizaciones.entity.SolicitudCotizacion;
import com.sonic.erp.cotizaciones.repository.OfertaProveedorRepository;
import com.sonic.erp.cotizaciones.repository.SolicitudCotizacionRepository;
import com.sonic.erp.cotizaciones.repository.SolicitudProveedorRepository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
public class OfertaProveedorService {

    private final OfertaProveedorRepository ofertaRepository;
    private final SolicitudCotizacionRepository solicitudRepository;
    private final OfertaValidacionService ofertaValidacionService;
    private final FechaLimiteCotizacionService fechaLimiteService;
    private final ProveedorVerificacionService proveedorVerificacionService;
    private final SolicitudProveedorRepository solicitudProveedorRepository;

    public OfertaProveedorService(
            OfertaProveedorRepository ofertaRepository,
            SolicitudCotizacionRepository solicitudRepository,
            OfertaValidacionService ofertaValidacionService,
            FechaLimiteCotizacionService fechaLimiteService,
            SolicitudProveedorRepository solicitudProveedorRepository,
            ProveedorVerificacionService proveedorVerificacionService) {

        this.ofertaRepository = ofertaRepository;
        this.solicitudRepository = solicitudRepository;
        this.ofertaValidacionService = ofertaValidacionService;
        this.fechaLimiteService = fechaLimiteService;
        this.proveedorVerificacionService = proveedorVerificacionService;
        this.solicitudProveedorRepository = solicitudProveedorRepository;
    }

    @Transactional
    public Long registrar(RegistrarOfertaRequest datos) {

        SolicitudCotizacion solicitud = solicitudRepository
                .findById(datos.idSolicitud())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La solicitud de cotización no existe"
                ));

        String estado = solicitud.getEstado();

        if (!"GENERADA".equalsIgnoreCase(estado)
                && !"ENVIADA".equalsIgnoreCase(estado)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La solicitud de cotización no está abierta para recibir ofertas"
            );
        }

        fechaLimiteService.validarVigencia(solicitud);


        List<Long> productosRequeridos;

        if (solicitud.getRequisicion() != null) {

            productosRequeridos = solicitud
                    .getRequisicion()
                    .getDetalles()
                    .stream()
                    .map(detalle -> detalle.getProductoId())
                    .toList();

        } else if (solicitud.getConsolidacion() != null) {

            productosRequeridos = solicitud
                    .getConsolidacion()
                    .getDetalles()
                    .stream()
                    .map(detalle -> detalle.getProductoId())
                    .toList();

        } else {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La solicitud no tiene una requisición ni una consolidación asociada"
            );
        }


        for (DetalleOfertaRequest item : datos.detalles()) {

            if (!productosRequeridos.contains(item.productoId())) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "El producto " + item.productoId()
                                + " no pertenece a la solicitud de cotización"
                );
            }
        }

        proveedorVerificacionService.verificarExistencia(datos.proveedorId());


        if ("ENVIADA".equalsIgnoreCase(estado)
                && !solicitudProveedorRepository
                .existsBySolicitud_IdSolicitudAndProveedorId(
                        solicitud.getIdSolicitud(),
                        datos.proveedorId())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "El proveedor " + datos.proveedorId()
                            + " no fue seleccionado para esta solicitud de cotización"
            );
        }

        LocalDate hoy = LocalDate.now(
                ZoneId.of("America/La_Paz")
        );

        OfertaProveedor oferta = OfertaProveedor.builder()
                .proveedorId(datos.proveedorId())
                .solicitud(solicitud)
                .fecha(hoy)
                .validez(datos.validez())
                .estado("REGISTRADA")
                .build();

        for (DetalleOfertaRequest item : datos.detalles()) {

            DetalleOferta detalle = DetalleOferta.builder()
                    .productoId(item.productoId())
                    .cantidad(item.cantidad())
                    .precio(item.precio())
                    .plazoEntrega(item.plazoEntrega())
                    .oferta(oferta)
                    .build();

            oferta.getDetalles().add(detalle);
        }

        List<String> errores = ofertaValidacionService.validar(oferta);

        if (!errores.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    String.join("; ", errores)
            );
        }

        for (DetalleOferta detalle : oferta.getDetalles()) {

            if (detalle.getCantidad() == null
                    || detalle.getCantidad() <= 0) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La cantidad de cada producto debe ser mayor que cero"
                );
            }
        }

        return ofertaRepository
                .save(oferta)
                .getIdOferta();
    }


    @Transactional
    public Long actualizar(Long idOferta, ActualizarOfertaRequest datos) {

        OfertaProveedor oferta = ofertaRepository.findById(idOferta)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La oferta no existe"
                ));

        SolicitudCotizacion solicitud = oferta.getSolicitud();
        String estado = solicitud.getEstado();

        if (!"GENERADA".equalsIgnoreCase(estado)
                && !"ENVIADA".equalsIgnoreCase(estado)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede actualizar una oferta de una solicitud cerrada"
            );
        }

        fechaLimiteService.validarVigencia(solicitud);

        List<Long> productosRequeridos;

        if (solicitud.getRequisicion() != null) {
            productosRequeridos = solicitud.getRequisicion()
                    .getDetalles()
                    .stream()
                    .map(detalle -> detalle.getProductoId())
                    .toList();
        } else if (solicitud.getConsolidacion() != null) {
            productosRequeridos = solicitud.getConsolidacion()
                    .getDetalles()
                    .stream()
                    .map(detalle -> detalle.getProductoId())
                    .toList();
        } else {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La solicitud no tiene productos asociados"
            );
        }

        for (DetalleOfertaRequest item : datos.detalles()) {
            if (!productosRequeridos.contains(item.productoId())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "El producto " + item.productoId()
                                + " no pertenece a la solicitud"
                );
            }
        }

        oferta.setValidez(datos.validez());
        oferta.getDetalles().clear();

        for (DetalleOfertaRequest item : datos.detalles()) {
            DetalleOferta detalle = DetalleOferta.builder()
                    .productoId(item.productoId())
                    .cantidad(item.cantidad())
                    .precio(item.precio())
                    .plazoEntrega(item.plazoEntrega())
                    .oferta(oferta)
                    .build();

            oferta.getDetalles().add(detalle);
        }

        List<String> errores = ofertaValidacionService.validar(oferta);

        if (!errores.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    String.join("; ", errores)
            );
        }

        for (DetalleOferta detalle : oferta.getDetalles()) {
            if (detalle.getCantidad() == null
                    || detalle.getCantidad() <= 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La cantidad debe ser mayor que cero"
                );
            }
        }

        return ofertaRepository.save(oferta).getIdOferta();
    }

    @Transactional
    public com.sonic.erp.cotizaciones.dto.response.AdjudicarOfertaResponse adjudicarOferta(Long idOferta) {
        OfertaProveedor ofertaGanadora = ofertaRepository.findById(idOferta)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La oferta con ID " + idOferta + " no existe"
                ));
        SolicitudCotizacion solicitud = ofertaGanadora.getSolicitud();
        if ("CERRADA".equalsIgnoreCase(solicitud.getEstado())
                || "CANCELADA".equalsIgnoreCase(solicitud.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La solicitud de cotización ya se encuentra " + solicitud.getEstado()
            );
        }
        List<OfertaProveedor> ofertasDeSolicitud = ofertaRepository
                .findBySolicitud_IdSolicitud(solicitud.getIdSolicitud());
        for (OfertaProveedor oferta : ofertasDeSolicitud) {
            if (oferta.getIdOferta().equals(idOferta)) {
                oferta.setEstado("SELECCIONADA");
            } else {
                oferta.setEstado("RECHAZADA");
            }
        }
        ofertaRepository.saveAll(ofertasDeSolicitud);
        solicitud.setEstado("CERRADA");
        solicitudRepository.save(solicitud);
        LocalDate hoy = LocalDate.now(ZoneId.of("America/La_Paz"));
        return com.sonic.erp.cotizaciones.dto.response.AdjudicarOfertaResponse.builder()
                .mensaje("Oferta adjudicada correctamente como ganadora")
                .idOfertaGanadora(ofertaGanadora.getIdOferta())
                .proveedorId(ofertaGanadora.getProveedorId())
                .idSolicitud(solicitud.getIdSolicitud())
                .estadoOferta(ofertaGanadora.getEstado())
                .estadoSolicitud(solicitud.getEstado())
                .fechaAdjudicacion(hoy)
                .build();
    }
}
