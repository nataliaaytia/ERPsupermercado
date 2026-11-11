package com.sonic.erp.ordenesdecompra.service;

import com.sonic.erp.ordenesdecompra.dto.request.RegistrarCostoTransporteRequest;
import com.sonic.erp.ordenesdecompra.dto.response.CostoTransporteResponse;
import com.sonic.erp.ordenesdecompra.entity.DetalleRecepcion;
import com.sonic.erp.ordenesdecompra.entity.Recepcion;
import com.sonic.erp.ordenesdecompra.repository.DetalleRecepcionRepository;
import com.sonic.erp.ordenesdecompra.repository.RecepcionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CostoTransporteRecepcionService {

    private final RecepcionRepository recepcionRepository;
    private final DetalleRecepcionRepository detalleRecepcionRepository;

    public CostoTransporteRecepcionService(
            RecepcionRepository recepcionRepository,
            DetalleRecepcionRepository detalleRecepcionRepository) {
        this.recepcionRepository = recepcionRepository;
        this.detalleRecepcionRepository = detalleRecepcionRepository;
    }

    @Transactional
    public CostoTransporteResponse registrar(
            Long idRecepcion,
            RegistrarCostoTransporteRequest request) {

        if (idRecepcion == null || idRecepcion <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El identificador de la recepción no es válido"
            );
        }

        if (request == null
                || request.importe() == null
                || request.importe().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El importe es obligatorio y no puede ser negativo"
            );
        }

        if (request.concepto() == null || request.concepto().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El concepto es obligatorio"
            );
        }

        if (request.comprobante() == null
                || request.comprobante().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El comprobante de transporte es obligatorio"
            );
        }

        Recepcion recepcion = buscarRecepcion(idRecepcion);
        validarEditable(recepcion);

        recepcion.setCostoTransporte(request.importe());
        recepcion.setConceptoTransporte(request.concepto().trim());
        recepcion.setComprobanteTransporte(
                request.comprobante().trim()
        );

        Recepcion guardada =
                recepcionRepository.saveAndFlush(recepcion);

        return construirRespuesta(guardada);
    }

    @Transactional(readOnly = true)
    public CostoTransporteResponse consultar(Long idRecepcion) {
        if (idRecepcion == null || idRecepcion <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El identificador de la recepción no es válido"
            );
        }

        return construirRespuesta(buscarRecepcion(idRecepcion));
    }

    private Recepcion buscarRecepcion(Long idRecepcion) {
        return recepcionRepository.findById(idRecepcion)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La recepción no existe"
                ));
    }

    private void validarEditable(Recepcion recepcion) {
        if ("AUTORIZADA".equalsIgnoreCase(recepcion.getEstado())
                || "VALIDADA".equalsIgnoreCase(recepcion.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede cambiar el costo de una recepción autorizada o validada"
            );
        }

        List<DetalleRecepcion> detalles =
                detalleRecepcionRepository
                        .findByRecepcionIdRecepcion(
                                recepcion.getIdRecepcion()
                        );

        boolean inspeccionIniciada = detalles.stream()
                .anyMatch(detalle ->
                        detalle.getInspecciones() != null
                                && !detalle.getInspecciones().isEmpty()
                );

        if (inspeccionIniciada) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede cambiar el costo porque la inspección ya comenzó"
            );
        }
    }

    private CostoTransporteResponse construirRespuesta(
            Recepcion recepcion) {
        return new CostoTransporteResponse(
                recepcion.getIdRecepcion(),
                recepcion.getIdOrden(),
                recepcion.getCostoTransporte(),
                recepcion.getConceptoTransporte(),
                recepcion.getComprobanteTransporte()
        );
    }
}