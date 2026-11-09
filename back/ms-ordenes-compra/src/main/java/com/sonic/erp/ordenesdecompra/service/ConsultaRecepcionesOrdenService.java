
package com.sonic.erp.ordenesdecompra.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

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

        if (idOrden == null || idOrden <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El identificador de la orden no es valido"
            );
        }

        try {

            EstadoRecepcion resultado = restClient.get()
                    .uri(
                            "/api/recepciones/orden/{idOrden}/existencia",
                            idOrden
                    )
                    .retrieve()
                    .body(EstadoRecepcion.class);

            if (resultado == null
                    || resultado.tieneRecepciones() == null) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Recepcion no devolvio una respuesta valida"
                );
            }

            return resultado.tieneRecepciones();

        } catch (RestClientException e) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "No se pudo consultar el servicio de Recepcion",
                    e
            );
        }
    }

    public record EstadoRecepcion(
            Boolean tieneRecepciones
    ) {
    }
}
