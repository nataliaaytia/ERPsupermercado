
package com.sonic.erp.ordenesdecompra.controller;

import com.sonic.erp.ordenesdecompra.repository.RecepcionRepository;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/recepciones")
@CrossOrigin(origins = "*")
public class ConsultaRecepcionesController {

    private final RecepcionRepository repository;

    public ConsultaRecepcionesController(
            RecepcionRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/orden/{idOrden}/existencia")
    public EstadoRecepcion consultarExistencia(
            @PathVariable Long idOrden) {

        if (idOrden == null || idOrden <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El identificador de la orden no es valido"
            );
        }

        // No podemos garantizar el resultado si existen
        // recepciones antiguas sin identificar su orden.
        if (repository.existsByIdOrdenIsNull()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Existen recepciones sin orden vinculada"
            );
        }

        boolean tieneRecepciones =
                repository.existsByIdOrden(idOrden);

        return new EstadoRecepcion(tieneRecepciones);
    }

    public record EstadoRecepcion(
            Boolean tieneRecepciones
    ) {
    }
}
