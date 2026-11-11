package com.sonic.erp.ordenesdecompra.service;

import com.sonic.erp.ordenesdecompra.dto.request.CondicionesLogisticasRequest;
import com.sonic.erp.ordenesdecompra.dto.response.CondicionesLogisticasResponse;
import com.sonic.erp.ordenesdecompra.entity.OrdenCompra;
import com.sonic.erp.ordenesdecompra.repository.OrdenCompraRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CondicionesLogisticasService {

    private final OrdenCompraRepository ordenCompraRepository;

    public CondicionesLogisticasService(
            OrdenCompraRepository ordenCompraRepository) {
        this.ordenCompraRepository = ordenCompraRepository;
    }

    @Transactional
    public CondicionesLogisticasResponse registrar(
            Long idOrden,
            CondicionesLogisticasRequest request) {

        validarIdOrden(idOrden);

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe enviar las condiciones logísticas"
            );
        }

        OrdenCompra orden = ordenCompraRepository.findByIdForUpdate(idOrden)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La orden de compra no existe"
                ));

        validarOrdenEditable(orden);

        orden.setDestinoEntrega(request.destinoEntrega().trim());
        orden.setHorarioEntrega(request.horarioEntrega().trim());
        orden.setResponsableEntrega(request.responsableEntrega().trim());

        OrdenCompra guardada =
                ordenCompraRepository.saveAndFlush(orden);

        return construirRespuesta(guardada);
    }

    @Transactional(readOnly = true)
    public CondicionesLogisticasResponse consultar(Long idOrden) {
        validarIdOrden(idOrden);

        OrdenCompra orden = ordenCompraRepository.findById(idOrden)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La orden de compra no existe"
                ));

        if (orden.getDestinoEntrega() == null
                || orden.getHorarioEntrega() == null
                || orden.getResponsableEntrega() == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "La orden todavía no tiene condiciones logísticas registradas"
            );
        }

        return construirRespuesta(orden);
    }

    private void validarIdOrden(Long idOrden) {
        if (idOrden == null || idOrden <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El identificador de la orden no es válido"
            );
        }
    }

    private void validarOrdenEditable(OrdenCompra orden) {
        if ("CERRADA".equalsIgnoreCase(orden.getEstado())
                || "ANULADA".equalsIgnoreCase(orden.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se pueden modificar las condiciones logísticas "
                            + "de una orden cerrada o anulada"
            );
        }
    }

    private CondicionesLogisticasResponse construirRespuesta(
            OrdenCompra orden) {
        return new CondicionesLogisticasResponse(
                orden.getIdOrden(),
                orden.getNumero(),
                orden.getDestinoEntrega(),
                orden.getHorarioEntrega(),
                orden.getResponsableEntrega()
        );
    }
}