package com.sonic.erp.ordenesdecompra.controller;

import com.sonic.erp.ordenesdecompra.dto.response.SaldoRecepcionOrdenResponse;
import com.sonic.erp.ordenesdecompra.repository.RecepcionRepository;
import com.sonic.erp.ordenesdecompra.service.ConsultaSaldosRecepcionService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/recepciones")
@CrossOrigin(origins = "*")
public class ConsultaRecepcionesController {

    private final RecepcionRepository repository;
    private final ConsultaSaldosRecepcionService consultaSaldosService;

    public ConsultaRecepcionesController(
            RecepcionRepository repository,
            ConsultaSaldosRecepcionService consultaSaldosService) {
        this.repository = repository;
        this.consultaSaldosService = consultaSaldosService;
    }

    @GetMapping("/orden/{idOrden}/existencia")
    public EstadoRecepcion consultarExistencia(
            @PathVariable Long idOrden) {

        validarIdOrden(idOrden);

        if (repository.existsByIdOrdenIsNull()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Existen recepciones sin orden vinculada"
            );
        }

        return new EstadoRecepcion(repository.existsByIdOrden(idOrden));
    }

    @GetMapping("/orden/{idOrden}/saldos")
    public SaldoRecepcionOrdenResponse consultarSaldos(
            @PathVariable Long idOrden) {
        return consultaSaldosService.consultarSaldos(idOrden);
    }

    private void validarIdOrden(Long idOrden) {
        if (idOrden == null || idOrden <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El identificador de la orden no es válido"
            );
        }
    }

    public record EstadoRecepcion(Boolean tieneRecepciones) {
    }
}