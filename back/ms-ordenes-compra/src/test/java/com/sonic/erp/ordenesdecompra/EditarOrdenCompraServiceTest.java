
package com.sonic.erp.ordenesdecompra;

import com.sonic.erp.ordenesdecompra.dto.request.EditarOrdenCompraRequest;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class EditarOrdenCompraServiceTest {

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

    private OrdenCompra crearOrden(String estado) {
        OrdenCompra orden = OrdenCompra.builder()
                .idOrden(1L)
                .idOferta(11L)
                .proveedorId(1L)
                .numero("OC-PRUEBA")
                .estado(estado)
                .total(new BigDecimal("250.00"))
                .build();

        orden.agregarDetalle(DetalleOrdenCompra.builder()
                .productoId(101L)
                .cantidad(10)
                .precio(new BigDecimal("12.50"))
                .subtotal(new BigDecimal("125.00"))
                .build());

        orden.agregarDetalle(DetalleOrdenCompra.builder()
                .productoId(102L)
                .cantidad(5)
                .precio(new BigDecimal("25.00"))
                .subtotal(new BigDecimal("125.00"))
                .build());

        return orden;
    }

    private EditarOrdenCompraRequest solicitud(
            Long productoId, Integer cantidad) {

        return new EditarOrdenCompraRequest(
                List.of(new EditarOrdenCompraRequest.Linea(
                        productoId, cantidad))
        );
    }

    @Test
    void debeEditarYRecalcularImportes() {
        OrdenCompra orden = crearOrden("BORRADOR");

        when(repository.findById(1L))
                .thenReturn(Optional.of(orden));

        when(repository.saveAndFlush(any(OrdenCompra.class)))
                .thenAnswer(i -> i.getArgument(0));

        EditarOrdenCompraRequest request =
                new EditarOrdenCompraRequest(List.of(
                        new EditarOrdenCompraRequest.Linea(101L, 15),
                        new EditarOrdenCompraRequest.Linea(102L, 8)
                ));

        OrdenCompra resultado = service.editarBorrador(1L, request);

        assertEquals(0, new BigDecimal("387.50")
                .compareTo(resultado.getTotal()));
        assertEquals(11L, resultado.getIdOferta());
        assertEquals(1L, resultado.getProveedorId());
        assertEquals("BORRADOR", resultado.getEstado());
        assertEquals(2, resultado.getDetalles().size());

        verify(repository).saveAndFlush(orden);
    }

    @Test
    void debePermitirEliminarUnaLinea() {
        OrdenCompra orden = crearOrden("BORRADOR");

        when(repository.findById(1L))
                .thenReturn(Optional.of(orden));

        when(repository.saveAndFlush(any(OrdenCompra.class)))
                .thenAnswer(i -> i.getArgument(0));

        OrdenCompra resultado = service.editarBorrador(
                1L, solicitud(101L, 10));

        assertEquals(1, resultado.getDetalles().size());
        assertEquals(101L,
                resultado.getDetalles().get(0).getProductoId());
        assertEquals(0, new BigDecimal("125.00")
                .compareTo(resultado.getTotal()));
    }

    @Test
    void debeRechazarCantidadCero() {
        when(repository.findById(1L))
                .thenReturn(Optional.of(crearOrden("BORRADOR")));

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.editarBorrador(
                        1L, solicitud(101L, 0))
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void debeRechazarCantidadNegativa() {
        when(repository.findById(1L))
                .thenReturn(Optional.of(crearOrden("BORRADOR")));

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.editarBorrador(
                        1L, solicitud(101L, -5))
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void debeRechazarProductosDuplicados() {
        when(repository.findById(1L))
                .thenReturn(Optional.of(crearOrden("BORRADOR")));

        EditarOrdenCompraRequest request =
                new EditarOrdenCompraRequest(List.of(
                        new EditarOrdenCompraRequest.Linea(101L, 10),
                        new EditarOrdenCompraRequest.Linea(101L, 5)
                ));

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.editarBorrador(1L, request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void debeRechazarOrdenInexistente() {
        when(repository.findById(99999L))
                .thenReturn(Optional.empty());

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.editarBorrador(
                        99999L, solicitud(101L, 10))
        );

        assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode());
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void debeRechazarOrdenAprobada() {
        when(repository.findById(1L))
                .thenReturn(Optional.of(crearOrden("APROBADA")));

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.editarBorrador(
                        1L, solicitud(101L, 10))
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void debeRechazarOrdenEnviada() {
        when(repository.findById(1L))
                .thenReturn(Optional.of(crearOrden("ENVIADA")));

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.editarBorrador(
                        1L, solicitud(101L, 10))
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void debeRechazarProductoAjenoALaOrden() {
        when(repository.findById(1L))
                .thenReturn(Optional.of(crearOrden("BORRADOR")));

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.editarBorrador(
                        1L, solicitud(999L, 10))
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verify(repository, never()).saveAndFlush(any());
    }
}
