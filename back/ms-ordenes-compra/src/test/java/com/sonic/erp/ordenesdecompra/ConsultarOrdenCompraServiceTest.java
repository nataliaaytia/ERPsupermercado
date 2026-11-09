
package com.sonic.erp.ordenesdecompra;

import com.sonic.erp.ordenesdecompra.dto.response.OrdenCompraDetalleResponse;
import com.sonic.erp.ordenesdecompra.entity.DetalleOrdenCompra;
import com.sonic.erp.ordenesdecompra.entity.OrdenCompra;
import com.sonic.erp.ordenesdecompra.repository.OrdenCompraRepository;
import com.sonic.erp.ordenesdecompra.service.OrdenCompraService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ConsultarOrdenCompraServiceTest {

    private OrdenCompraRepository repository;
    private OrdenCompraService service;

    @BeforeEach
    void preparar() {
        repository = mock(OrdenCompraRepository.class);

        service = new OrdenCompraService(
                repository,
                RestClient.builder(),
                "http://localhost:8082"
        );
    }

    private OrdenCompra crearOrden() {
        OrdenCompra orden = OrdenCompra.builder()
                .idOrden(1L)
                .numero("OC-PRUEBA")
                .idOferta(11L)
                .proveedorId(1L)
                .fecha(LocalDate.of(2026, 11, 8))
                .estado("BORRADOR")
                .total(new BigDecimal("387.50"))
                .build();

        orden.agregarDetalle(DetalleOrdenCompra.builder()
                .idDetalle(1L)
                .productoId(101L)
                .cantidad(15)
                .precio(new BigDecimal("12.50"))
                .subtotal(new BigDecimal("187.50"))
                .build());

        orden.agregarDetalle(DetalleOrdenCompra.builder()
                .idDetalle(2L)
                .productoId(102L)
                .cantidad(8)
                .precio(new BigDecimal("25.00"))
                .subtotal(new BigDecimal("200.00"))
                .build());

        return orden;
    }

    @Test
    void debeConsultarDetalleCorrectamente() {

        when(repository.findById(1L))
                .thenReturn(Optional.of(crearOrden()));

        OrdenCompraDetalleResponse resultado =
                service.consultarDetalle(1L);

        assertEquals(1L, resultado.idOrden());
        assertEquals("OC-PRUEBA", resultado.numero());
        assertEquals(11L, resultado.idOferta());
        assertEquals(1L, resultado.proveedorId());
        assertEquals("BORRADOR", resultado.estado());
        assertEquals(2, resultado.detalles().size());

        assertEquals(0, new BigDecimal("387.50")
                .compareTo(resultado.total()));

        assertEquals(101L,
                resultado.detalles().get(0).productoId());

        assertEquals(15,
                resultado.detalles().get(0).cantidad());

        assertEquals(102L,
                resultado.detalles().get(1).productoId());

        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void debeRechazarOrdenInexistente() {

        when(repository.findById(99999L))
                .thenReturn(Optional.empty());

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.consultarDetalle(99999L)
        );

        assertEquals(HttpStatus.NOT_FOUND,
                error.getStatusCode());

        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void debeRechazarIdentificadorInvalido() {

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.consultarDetalle(-1L)
        );

        assertEquals(HttpStatus.BAD_REQUEST,
                error.getStatusCode());

        verify(repository, never()).findById(any());
        verify(repository, never()).saveAndFlush(any());
    }
}
