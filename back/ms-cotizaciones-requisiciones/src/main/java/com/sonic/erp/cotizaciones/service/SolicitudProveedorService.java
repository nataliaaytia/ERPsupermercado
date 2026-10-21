
package com.sonic.erp.cotizaciones.service;

import com.sonic.erp.cotizaciones.dto.request.AsociarProveedoresRequest;
import com.sonic.erp.cotizaciones.entity.SolicitudCotizacion;
import com.sonic.erp.cotizaciones.entity.SolicitudProveedor;
import com.sonic.erp.cotizaciones.repository.SolicitudCotizacionRepository;
import com.sonic.erp.cotizaciones.repository.SolicitudProveedorRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;

@Service
public class SolicitudProveedorService {

    private final SolicitudCotizacionRepository solicitudRepository;
    private final SolicitudProveedorRepository solicitudProveedorRepository;
    private final ProveedorVerificacionService proveedorVerificacionService;
    private final FechaLimiteCotizacionService fechaLimiteService;

    public SolicitudProveedorService(
            SolicitudCotizacionRepository solicitudRepository,
            SolicitudProveedorRepository solicitudProveedorRepository,
            ProveedorVerificacionService proveedorVerificacionService,
            FechaLimiteCotizacionService fechaLimiteService) {

        this.solicitudRepository = solicitudRepository;
        this.solicitudProveedorRepository = solicitudProveedorRepository;
        this.proveedorVerificacionService = proveedorVerificacionService;
        this.fechaLimiteService = fechaLimiteService;
    }

    @Transactional
    public List<Long> asociar(
            Long idSolicitud,
            AsociarProveedoresRequest datos) {

        SolicitudCotizacion solicitud = solicitudRepository
                .findById(idSolicitud)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La solicitud de cotización no existe"
                ));

        if (!"GENERADA".equalsIgnoreCase(solicitud.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Solo se pueden asociar proveedores a solicitudes GENERADAS"
            );
        }

        fechaLimiteService.validarVigencia(solicitud);

        if (datos == null
                || datos.proveedoresIds() == null
                || datos.proveedoresIds().isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe seleccionar al menos un proveedor"
            );
        }

        List<Long> ids = datos.proveedoresIds();

        if (ids.stream().anyMatch(id -> id == null || id <= 0)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Los identificadores de proveedores deben ser positivos"
            );
        }

        if (new HashSet<>(ids).size() != ids.size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No se permiten proveedores repetidos"
            );
        }

        for (Long proveedorId : ids) {

            if (solicitudProveedorRepository
                    .existsBySolicitud_IdSolicitudAndProveedorId(
                            idSolicitud, proveedorId)) {

                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "El proveedor " + proveedorId
                                + " ya está asociado a esta solicitud"
                );
            }

            var proveedor = proveedorVerificacionService
                    .verificarExistencia(proveedorId);

            if (!"Activo".equalsIgnoreCase(proveedor.estado())
                    || !Boolean.TRUE.equals(proveedor.validado())) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "El proveedor " + proveedorId
                                + " debe estar activo y validado"
                );
            }
        }

        List<SolicitudProveedor> asociaciones = ids.stream()
                .map(proveedorId -> SolicitudProveedor.builder()
                        .solicitud(solicitud)
                        .proveedorId(proveedorId)
                        .build())
                .toList();

        solicitudProveedorRepository.saveAll(asociaciones);

        solicitud.setEstado("ENVIADA");
        solicitudRepository.save(solicitud);

        return ids;
    }


    @Transactional(readOnly = true)
    public List<Long> listarPorSolicitud(Long idSolicitud) {

        if (!solicitudRepository.existsById(idSolicitud)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "La solicitud de cotización no existe"
            );
        }

        return solicitudProveedorRepository
                .findBySolicitud_IdSolicitud(idSolicitud)
                .stream()
                .map(SolicitudProveedor::getProveedorId)
                .toList();
    }

}
