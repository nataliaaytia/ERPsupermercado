package com.sonic.erp.ordenesdecompra.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ConsultaRecepcionesOrdenService {

    private final RestClient restClient;

    public ConsultaRecepcionesOrdenService(
            RestClient.Builder builder,
            @Value("${servicios.recepcion.url:http://localhost:8084}")
            String urlRecepcion) {
        this.restClient = builder
                .baseUrl(urlRecepcion)
                .build();
    }

    public boolean tieneRecepciones(Long idOrden) {
        validarIdOrden(idOrden);

        try {
            EstadoRecepcion resultado = restClient.get()
                    .uri(
                            "/api/recepciones/orden/{idOrden}/existencia",
                            idOrden
                    )
                    .retrieve()
                    .body(EstadoRecepcion.class);

            if (resultado == null || resultado.tieneRecepciones() == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Recepción no devolvió una respuesta válida"
                );
            }

            return resultado.tieneRecepciones();
        } catch (RestClientException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "No se pudo consultar el servicio de Recepción",
                    e
            );
        }
    }

    public RespuestaSaldosRecepcion consultarSaldos(Long idOrden) {
        validarIdOrden(idOrden);

        try {
            RespuestaSaldosRecepcion resultado = restClient.get()
                    .uri(
                            "/api/recepciones/orden/{idOrden}/saldos",
                            idOrden
                    )
                    .retrieve()
                    .body(RespuestaSaldosRecepcion.class);

            if (resultado == null || resultado.detalles() == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Recepción no devolvió saldos válidos"
                );
            }

            return resultado;
        } catch (RestClientException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "No se pudo consultar los saldos en Recepción",
                    e
            );
        }
    }

    private void validarIdOrden(Long idOrden) {
        if (idOrden == null || idOrden <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El identificador de la orden no es válido"
            );
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record EstadoRecepcion(Boolean tieneRecepciones) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record RespuestaSaldosRecepcion(
            Long idOrden,
            List<DetalleSaldoRecepcion> detalles
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record DetalleSaldoRecepcion(
            Long productoId,
            Integer cantidadAceptada,
            Integer cantidadRechazada
    ) {
    }
}