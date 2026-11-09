
package com.sonic.erp.ordenesdecompra.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ConsultaProveedorOrdenService {

    private final RestClient proveedorClient;

    public ConsultaProveedorOrdenService(
            RestClient.Builder builder,
            @Value("${servicios.proveedores.url:http://localhost:8080}")
            String urlProveedores) {

        this.proveedorClient = builder
                .baseUrl(urlProveedores)
                .build();
    }

    public ProveedorContacto obtenerContacto(Long idProveedor) {

        if (idProveedor == null || idProveedor <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El identificador del proveedor no es valido");
        }

        ProveedorContacto proveedor;

        try {
            proveedor = proveedorClient.get()
                    .uri("/proveedores/{id}", idProveedor)
                    .retrieve()
                    .body(ProveedorContacto.class);

        } catch (RestClientException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "No se pudo consultar el servicio de proveedores",
                    e
            );
        }

        if (proveedor == null ||
                proveedor.correo() == null ||
                proveedor.correo().isBlank() ||
                !proveedor.correo().trim()
                        .matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El proveedor no tiene un correo electronico valido");
        }

        return proveedor;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ProveedorContacto(
            Long idProveedor,
            String razonSocial,
            String correo
    ) {
    }
}
