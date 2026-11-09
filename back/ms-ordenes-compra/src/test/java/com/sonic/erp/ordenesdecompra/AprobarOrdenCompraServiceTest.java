
package com.sonic.erp.ordenesdecompra;

import com.sonic.erp.ordenesdecompra.dto.response.AprobacionOrdenCompraResponse;
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

class AprobarOrdenCompraServiceTest {

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
                .proveedorId(1L)
                .idOferta(11L)
                .estado("PENDIENTE_APROBACION")
                .total(new BigDecimal("387.50"))
                .build();
    }

    @Test
    void debeAprobarOrdenCorrectamente() {
        OrdenCompra orden = crearOrdenPendiente();

        when(repository.findById(1L))
                .thenReturn(Optional.of(orden));

        when(repository.saveAndFlush(any(OrdenCompra.class)))
                .thenAnswer(invocacion ->
                        invocacion.getArgument(0));

        AprobacionOrdenCompraResponse resultado =
                service.aprobarOrden(
                        1L,
                        "jefe.compras",
                        "JEFE_COMPRAS",
                        new BigDecimal("500.00")
                );

        assertEquals("APROBADA", resultado.estado());
        assertEquals("jefe.compras", resultado.aprobadoPor());
        assertNotNull(resultado.fechaAprobacion());
        assertEquals(
                0,
                new BigDecimal("387.50")
                        .compareTo(resultado.total())
        );

        verify(repository).saveAndFlush(orden);
    }

    @Test
    void debeRechazarRolSinPermiso() {
        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.aprobarOrden(
                        1L,
                        "comprador",
                        "COMPRADOR",
                        new BigDecimal("500.00")
                )
        );

        assertEquals(
                HttpStatus.FORBIDDEN,
                error.getStatusCode()
        );

        verifyNoInteractions(repository);
    }

    @Test
    void debeRechazarUsuarioVacio() {
        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.aprobarOrden(
                        1L,
                        "",
                        "JEFE_COMPRAS",
                        new BigDecimal("500.00")
                )
        );

        assertEquals(
                HttpStatus.FORBIDDEN,
                error.getStatusCode()
        );

        verifyNoInteractions(repository);
    }

    @Test
    void debeRechazarMontoSuperiorAlLimite() {
        OrdenCompra orden = crearOrdenPendiente();

        when(repository.findById(1L))
                .thenReturn(Optional.of(orden));

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.aprobarOrden(
                        1L,
                        "jefe.compras",
                        "JEFE_COMPRAS",
                        new BigDecimal("200.00")
                )
        );

        assertEquals(
                HttpStatus.FORBIDDEN,
                error.getStatusCode()
        );

        verify(repository, never())
                .saveAndFlush(any(OrdenCompra.class));
    }

    @Test
    void debeRechazarLimiteNoDefinido() {
        OrdenCompra orden = crearOrdenPendiente();

        when(repository.findById(1L))
                .thenReturn(Optional.of(orden));

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.aprobarOrden(
                        1L,
                        "jefe.compras",
                        "JEFE_COMPRAS",
                        null
                )
        );

        assertEquals(
                HttpStatus.FORBIDDEN,
                error.getStatusCode()
        );

        verify(repository, never())
                .saveAndFlush(any(OrdenCompra.class));
    }

    @Test
    void debeImpedirAprobacionRepetida() {
        OrdenCompra orden = crearOrdenPendiente();
        orden.setEstado("APROBADA");

        when(repository.findById(1L))
                .thenReturn(Optional.of(orden));

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.aprobarOrden(
                        1L,
                        "jefe.compras",
                        "JEFE_COMPRAS",
                        new BigDecimal("500.00")
                )
        );

        assertEquals(
                HttpStatus.CONFLICT,
                error.getStatusCode()
        );

        verify(repository, never())
                .saveAndFlush(any(OrdenCompra.class));
    }

    @Test
    void debeRechazarOrdenEnBorrador() {
        OrdenCompra orden = crearOrdenPendiente();
        orden.setEstado("BORRADOR");

        when(repository.findById(1L))
                .thenReturn(Optional.of(orden));

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.aprobarOrden(
                        1L,
                        "jefe.compras",
                        "JEFE_COMPRAS",
                        new BigDecimal("500.00")
                )
        );

        assertEquals(
                HttpStatus.CONFLICT,
                error.getStatusCode()
        );

        verify(repository, never())
                .saveAndFlush(any(OrdenCompra.class));
    }

    @Test
    void debeRechazarOrdenInexistente() {
        when(repository.findById(999L))
                .thenReturn(Optional.empty());

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.aprobarOrden(
                        999L,
                        "jefe.compras",
                        "JEFE_COMPRAS",
                        new BigDecimal("500.00")
                )
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
                () -> service.aprobarOrden(
                        -1L,
                        "jefe.compras",
                        "JEFE_COMPRAS",
                        new BigDecimal("500.00")
                )
        );

        assertEquals(
                HttpStatus.BAD_REQUEST,
                error.getStatusCode()
        );

        verifyNoInteractions(repository);
    }
}
