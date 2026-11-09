
package com.sonic.erp.ordenesdecompra;

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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class SolicitarAprobacionServiceTest {

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

    private OrdenCompra crearOrdenValida() {
        OrdenCompra orden = OrdenCompra.builder()
                .idOrden(1L)
                .numero("OC-PRUEBA-001")
                .idOferta(11L)
                .proveedorId(1L)
                .estado("BORRADOR")
                .total(new BigDecimal("387.50"))
                .build();

        DetalleOrdenCompra detalle = DetalleOrdenCompra.builder()
                .productoId(101L)
                .cantidad(1)
                .precio(new BigDecimal("387.50"))
                .subtotal(new BigDecimal("387.50"))
                .build();

        orden.agregarDetalle(detalle);

        return orden;
    }

    @Test
    void debeSolicitarAprobacionCorrectamente() {
        OrdenCompra orden = crearOrdenValida();

        when(repository.findById(1L))
                .thenReturn(Optional.of(orden));

        when(repository.saveAndFlush(any(OrdenCompra.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        OrdenCompra resultado = service.solicitarAprobacion(1L);

        assertEquals(
                "PENDIENTE_APROBACION",
                resultado.getEstado()
        );

        verify(repository).saveAndFlush(orden);
    }

    @Test
    void debeImpedirSolicitudRepetida() {
        OrdenCompra orden = crearOrdenValida();
        orden.setEstado("PENDIENTE_APROBACION");

        when(repository.findById(1L))
                .thenReturn(Optional.of(orden));

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.solicitarAprobacion(1L)
        );

        assertEquals(
                HttpStatus.CONFLICT,
                error.getStatusCode()
        );

        verify(repository, never())
                .saveAndFlush(any(OrdenCompra.class));
    }

    @Test
    void debeRechazarOrdenYaAprobada() {
        OrdenCompra orden = crearOrdenValida();
        orden.setEstado("APROBADA");

        when(repository.findById(1L))
                .thenReturn(Optional.of(orden));

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.solicitarAprobacion(1L)
        );

        assertEquals(
                HttpStatus.CONFLICT,
                error.getStatusCode()
        );

        verify(repository, never())
                .saveAndFlush(any(OrdenCompra.class));
    }

    @Test
    void debeRechazarOrdenSinProductos() {
        OrdenCompra orden = crearOrdenValida();
        orden.getDetalles().clear();

        when(repository.findById(1L))
                .thenReturn(Optional.of(orden));

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.solicitarAprobacion(1L)
        );

        assertEquals(
                HttpStatus.BAD_REQUEST,
                error.getStatusCode()
        );
    }

    @Test
    void debeRechazarTotalCero() {
        OrdenCompra orden = crearOrdenValida();
        orden.setTotal(BigDecimal.ZERO);

        when(repository.findById(1L))
                .thenReturn(Optional.of(orden));

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.solicitarAprobacion(1L)
        );

        assertEquals(
                HttpStatus.BAD_REQUEST,
                error.getStatusCode()
        );
    }

    @Test
    void debeRechazarOrdenInexistente() {
        when(repository.findById(999L))
                .thenReturn(Optional.empty());

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.solicitarAprobacion(999L)
        );

        assertEquals(
                HttpStatus.NOT_FOUND,
                error.getStatusCode()
        );
    }

    @Test
    void debeRechazarIdentificadorInvalido() {
        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.solicitarAprobacion(-1L)
        );

        assertEquals(
                HttpStatus.BAD_REQUEST,
                error.getStatusCode()
        );

        verifyNoInteractions(repository);
    }
}
