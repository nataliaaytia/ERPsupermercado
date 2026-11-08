
package com.sonic.erp.ordenesdecompra;

import com.sonic.erp.ordenesdecompra.entity.OrdenCompra;
import com.sonic.erp.ordenesdecompra.repository.OrdenCompraRepository;
import com.sonic.erp.ordenesdecompra.service.OrdenCompraService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class OrdenCompraServiceTest {

    private OrdenCompraRepository repository;
    private OrdenCompraService service;
    private MockRestServiceServer servidorSimulado;

    @BeforeEach
    void preparar() {
        repository = mock(OrdenCompraRepository.class);

        RestClient.Builder builder = RestClient.builder();

        servidorSimulado =
                MockRestServiceServer.bindTo(builder).build();

        service = new OrdenCompraService(
                repository,
                builder,
                "http://localhost:8082"
        );
    }

    private void simularOferta(String estado, String precio) {

        String respuesta = """
            {
              "ofertas": [
                {
                  "idOferta": 11,
                  "proveedorId": 1,
                  "estado": "%s",
                  "validez": "%s",
                  "detalles": [
                    {
                      "productoId": 101,
                      "cantidad": 10,
                      "precioUnitario": %s
                    },
                    {
                      "productoId": 102,
                      "cantidad": 5,
                      "precioUnitario": 25.00
                    }
                  ]
                }
              ]
            }
            """.formatted(
                    estado,
                    LocalDate.now(ZoneId.of("America/La_Paz")).plusDays(7),
                    precio
            );

        servidorSimulado.expect(requestTo(
                "http://localhost:8082/api/evaluacion-ofertas/solicitud/14"
        )).andRespond(
                withSuccess(respuesta, MediaType.APPLICATION_JSON)
        );
    }

    @Test
    void debeGenerarOrdenCorrectamente() {

        simularOferta("SELECCIONADA", "12.50");

        when(repository.saveAndFlush(any(OrdenCompra.class)))
                .thenAnswer(invocacion -> {
                    OrdenCompra orden = invocacion.getArgument(0);
                    orden.setIdOrden(1L);
                    return orden;
                });

        OrdenCompra orden = service.generarDesdeOferta(14L, 11L);

        assertEquals("BORRADOR", orden.getEstado());
        assertEquals(11L, orden.getIdOferta());
        assertEquals(1L, orden.getProveedorId());
        assertEquals(2, orden.getDetalles().size());

        assertEquals(0,
                new BigDecimal("250.00")
                        .compareTo(orden.getTotal()));

        verify(repository, times(1))
                .saveAndFlush(any(OrdenCompra.class));

        servidorSimulado.verify();
    }

    @Test
    void debeRechazarOfertaNoAdjudicada() {

        simularOferta("REGISTRADA", "12.50");

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.generarDesdeOferta(14L, 11L)
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());

        verify(repository, never())
                .saveAndFlush(any(OrdenCompra.class));

        servidorSimulado.verify();
    }

    @Test
    void debeRechazarImportesInvalidos() {

        simularOferta("SELECCIONADA", "0");

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.generarDesdeOferta(14L, 11L)
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());

        verify(repository, never())
                .saveAndFlush(any(OrdenCompra.class));

        servidorSimulado.verify();
    }

    @Test
    void debeEvitarOrdenDuplicada() {

        simularOferta("SELECCIONADA", "12.50");

        when(repository.existsByIdOferta(11L))
                .thenReturn(true);

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.generarDesdeOferta(14L, 11L)
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());

        verify(repository, never())
                .saveAndFlush(any(OrdenCompra.class));

        servidorSimulado.verify();
    }


    @Test
    void debeRechazarOfertaVencida() {

        String respuesta = """
        {
          "ofertas": [
            {
              "idOferta": 11,
              "proveedorId": 1,
              "estado": "SELECCIONADA",
              "validez": "2026-01-01",
              "detalles": [
                {
                  "productoId": 101,
                  "cantidad": 10,
                  "precioUnitario": 12.50
                }
              ]
            }
          ]
        }
        """;

        servidorSimulado.expect(requestTo(
                "http://localhost:8082/api/evaluacion-ofertas/solicitud/14"
        )).andRespond(
                withSuccess(respuesta, MediaType.APPLICATION_JSON)
        );

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.generarDesdeOferta(14L, 11L)
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());

        verify(repository, never())
                .saveAndFlush(any(OrdenCompra.class));

        servidorSimulado.verify();
    }

}
