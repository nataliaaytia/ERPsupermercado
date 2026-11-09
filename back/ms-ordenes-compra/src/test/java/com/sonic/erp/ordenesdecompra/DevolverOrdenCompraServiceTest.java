
package com.sonic.erp.ordenesdecompra;

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

class DevolverOrdenCompraServiceTest {

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

    private OrdenCompra crearOrdenPendiente() {
        return OrdenCompra.builder()
                .idOrden(1L)
                .numero("OC-PRUEBA-001")
                .idOferta(11L)
                .proveedorId(1L)
                .estado("PENDIENTE_APROBACION")
                .total(new BigDecimal("387.50"))
                .build();
    }

    private void configurarGuardado(OrdenCompra orden) {
        when(repository.findById(1L))
                .thenReturn(Optional.of(orden));

        when(repository.saveAndFlush(any(OrdenCompra.class)))
                .thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void debeDevolverCorrectamente() {
        OrdenCompra orden = crearOrdenPendiente();
        configurarGuardado(orden);

        OrdenCompra resultado =
                service.devolverParaCorreccion(
                        1L, "  Corregir cantidad  ");

        assertEquals("BORRADOR", resultado.getEstado());
        assertEquals("Corregir cantidad",
                resultado.getObservacion());
        assertEquals(1,
                resultado.getHistorialDevoluciones().size());

        var devolucion =
                resultado.getHistorialDevoluciones().get(0);

        assertEquals("Corregir cantidad",
                devolucion.getMotivo());
        assertEquals("SIN_AUTENTICACION",
                devolucion.getResponsable());
        assertNotNull(devolucion.getFechaDevolucion());
        assertSame(resultado, devolucion.getOrdenCompra());

        verify(repository).saveAndFlush(orden);
    }

    @Test
    void debeConservarHistorial() {
        OrdenCompra orden = crearOrdenPendiente();
        configurarGuardado(orden);

        service.devolverParaCorreccion(
                1L, "Corregir cantidad");

        orden.setEstado("PENDIENTE_APROBACION");

        service.devolverParaCorreccion(
                1L, "Corregir precio");

        assertEquals(2,
                orden.getHistorialDevoluciones().size());

        assertEquals("Corregir cantidad",
                orden.getHistorialDevoluciones()
                        .get(0).getMotivo());

        assertEquals("Corregir precio",
                orden.getHistorialDevoluciones()
                        .get(1).getMotivo());

        assertEquals("BORRADOR", orden.getEstado());
        verify(repository, times(2)).saveAndFlush(orden);
    }

    @Test
    void debeRechazarMotivoNulo() {
        var error = assertThrows(
                ResponseStatusException.class,
                () -> service.devolverParaCorreccion(1L, null));

        assertEquals(HttpStatus.BAD_REQUEST,
                error.getStatusCode());
        verifyNoInteractions(repository);
    }

    @Test
    void debeRechazarMotivoVacio() {
        var error = assertThrows(
                ResponseStatusException.class,
                () -> service.devolverParaCorreccion(1L, "   "));

        assertEquals(HttpStatus.BAD_REQUEST,
                error.getStatusCode());
        verifyNoInteractions(repository);
    }

    @Test
    void debeRechazarMotivoMuyLargo() {
        var error = assertThrows(
                ResponseStatusException.class,
                () -> service.devolverParaCorreccion(
                        1L, "A".repeat(501)));

        assertEquals(HttpStatus.BAD_REQUEST,
                error.getStatusCode());
        verifyNoInteractions(repository);
    }

    @Test
    void debeRechazarOrdenAprobada() {
        OrdenCompra orden = crearOrdenPendiente();
        orden.setEstado("APROBADA");

        when(repository.findById(1L))
                .thenReturn(Optional.of(orden));

        var error = assertThrows(
                ResponseStatusException.class,
                () -> service.devolverParaCorreccion(
                        1L, "Corregir cantidad"));

        assertEquals(HttpStatus.CONFLICT,
                error.getStatusCode());

        verify(repository, never())
                .saveAndFlush(any(OrdenCompra.class));
    }

    @Test
    void debeRechazarOrdenEnviada() {
        OrdenCompra orden = crearOrdenPendiente();
        orden.setEstado("ENVIADA");

        when(repository.findById(1L))
                .thenReturn(Optional.of(orden));

        var error = assertThrows(
                ResponseStatusException.class,
                () -> service.devolverParaCorreccion(
                        1L, "Corregir cantidad"));

        assertEquals(HttpStatus.CONFLICT,
                error.getStatusCode());

        verify(repository, never())
                .saveAndFlush(any(OrdenCompra.class));
    }

    @Test
    void debeRechazarOrdenEnBorrador() {
        OrdenCompra orden = crearOrdenPendiente();
        orden.setEstado("BORRADOR");

        when(repository.findById(1L))
                .thenReturn(Optional.of(orden));

        var error = assertThrows(
                ResponseStatusException.class,
                () -> service.devolverParaCorreccion(
                        1L, "Corregir cantidad"));

        assertEquals(HttpStatus.CONFLICT,
                error.getStatusCode());
    }

    @Test
    void debeRechazarOrdenInexistente() {
        when(repository.findById(999L))
                .thenReturn(Optional.empty());

        var error = assertThrows(
                ResponseStatusException.class,
                () -> service.devolverParaCorreccion(
                        999L, "Corregir cantidad"));

        assertEquals(HttpStatus.NOT_FOUND,
                error.getStatusCode());
    }

    @Test
    void debeRechazarIdentificadorInvalido() {
        var error = assertThrows(
                ResponseStatusException.class,
                () -> service.devolverParaCorreccion(
                        -1L, "Corregir cantidad"));

        assertEquals(HttpStatus.BAD_REQUEST,
                error.getStatusCode());

        verifyNoInteractions(repository);
    }
}
