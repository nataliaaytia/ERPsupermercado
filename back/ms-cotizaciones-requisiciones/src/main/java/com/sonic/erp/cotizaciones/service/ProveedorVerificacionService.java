
package com.sonic.erp.cotizaciones.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProveedorVerificacionService {

    private final RestClient cliente;

    public ProveedorVerificacionService(
            @Value("${integraciones.proveedores.url:http://localhost:8080}")
            String urlProveedores) {

        this.cliente = RestClient.builder()
                .baseUrl(urlProveedores)
                .build();
    }

    public void verificarExistencia(Long proveedorId) {

        try {
            ProveedorInfo proveedor = cliente.get()
                    .uri("/proveedores/{id}", proveedorId)
                    .retrieve()
                    .body(ProveedorInfo.class);

            if (proveedor == null
                    || !proveedorId.equals(proveedor.idProveedor())) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "La respuesta del servicio de proveedores no es válida"
                );
            }


        } catch (HttpClientErrorException.NotFound e) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "El proveedor con ID " + proveedorId + " no existe"
            );

        } catch (HttpClientErrorException.BadRequest e) {

            if (e.getResponseBodyAsString()
                    .contains("No se encontró el proveedor con el ID")) {

                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "El proveedor con ID " + proveedorId + " no existe"
                );
            }

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "El servicio de proveedores rechazó la consulta"
            );

        } catch (RestClientException e) {

            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "No se pudo consultar el servicio de proveedores"
            );
        }
    }

    public record ProveedorInfo(
            Long idProveedor,
            String estado,
            Boolean validado
    ) {
    }
}
