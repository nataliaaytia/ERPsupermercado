
package com.sonic.erp.ordenesdecompra;

import com.sonic.erp.ordenesdecompra.dto.request.AnularOrdenCompraRequest;
import com.sonic.erp.ordenesdecompra.entity.OrdenCompra;
import com.sonic.erp.ordenesdecompra.repository.OrdenCompraRepository;
import com.sonic.erp.ordenesdecompra.service.AnularOrdenCompraService;
import com.sonic.erp.ordenesdecompra.service.ConsultaRecepcionesOrdenService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AnularOrdenCompraServiceTest {

    private OrdenCompraRepository repository;
    private ConsultaRecepcionesOrdenService consultaRecepciones;
    private AnularOrdenCompraService service;

    @BeforeEach
    void preparar() {
        repository = mock(OrdenCompraRepository.class);
        consultaRecepciones =
                mock(ConsultaRecepcionesOrdenService.class);

        service = new AnularOrdenCompraService(
                repository,
                consultaRecepciones
        );
    }

    private OrdenCompra crearOrden(String estado) {
        return OrdenCompra.builder()
                .idOrden(11L)
                .numero("OC-TEST-SCRUM-521")
                .estado(estado)
                .build();
    }

    private AnularOrdenCompraRequest crearRequest(String motivo) {
        return new AnularOrdenCompraRequest(motivo);
    }

    private void prepararOrden(OrdenCompra orden) {
        when(repository.findByIdForUpdate(11L))
                .thenReturn(Optional.of(orden));
    }

    @Test
    void debeAnularOrdenSinRecepciones() {
        OrdenCompra orden = crearOrden("APROBADA");
        prepararOrden(orden);

        when(consultaRecepciones.tieneRecepciones(11L))
                .thenReturn(false);

        var resultado = service.anularOrden(
                11L,
                crearRequest("La compra ya no es necesaria.")
        );

        assertEquals("ANULADA", resultado.estadoOrden());
        assertEquals("ANULADA", orden.getEstado());
        assertEquals(
                "La compra ya no es necesaria.",
                orden.getMotivoAnulacion()
        );
        assertNotNull(resultado.fechaAnulacion());
        assertNotNull(orden.getFechaAnulacion());

        verify(consultaRecepciones).tieneRecepciones(11L);
        verify(repository).saveAndFlush(orden);
    }

    @Test
    void debeBloquearAnulacionConRecepciones() {
        OrdenCompra orden = crearOrden("APROBADA");
        prepararOrden(orden);

        when(consultaRecepciones.tieneRecepciones(11L))
                .thenReturn(true);

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.anularOrden(
                        11L,
                        crearRequest("Cancelar compra")
                )
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        assertEquals("APROBADA", orden.getEstado());
        assertNull(orden.getMotivoAnulacion());
        assertNull(orden.getFechaAnulacion());

        verify(consultaRecepciones).tieneRecepciones(11L);
        verify(repository, never())
                .saveAndFlush(any(OrdenCompra.class));
    }

    @Test
    void debeImpedirAnulacionRepetida() {
        OrdenCompra orden = crearOrden("APROBADA");
        prepararOrden(orden);

        when(consultaRecepciones.tieneRecepciones(11L))
                .thenReturn(false);

        service.anularOrden(
                11L,
                crearRequest("Compra cancelada")
        );

        var fechaOriginal = orden.getFechaAnulacion();

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.anularOrden(
                        11L,
                        crearRequest("Otro motivo")
                )
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        assertEquals("ANULADA", orden.getEstado());
        assertEquals("Compra cancelada", orden.getMotivoAnulacion());
        assertEquals(fechaOriginal, orden.getFechaAnulacion());

        verify(repository, times(1)).saveAndFlush(orden);
        verify(consultaRecepciones, times(1))
                .tieneRecepciones(11L);
    }

    @Test
    void debeRechazarMotivoVacio() {
        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.anularOrden(
                        11L,
                        crearRequest("   ")
                )
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verifyNoInteractions(repository);
        verifyNoInteractions(consultaRecepciones);
    }

    @Test
    void debeRechazarRequestNulo() {
        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.anularOrden(11L, null)
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verifyNoInteractions(repository);
        verifyNoInteractions(consultaRecepciones);
    }

    @Test
    void debeRechazarMotivoDemasiadoLargo() {
        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.anularOrden(
                        11L,
                        crearRequest("x".repeat(501))
                )
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verifyNoInteractions(repository);
        verifyNoInteractions(consultaRecepciones);
    }

    @Test
    void debeRechazarOrdenInexistente() {
        when(repository.findByIdForUpdate(99L))
                .thenReturn(Optional.empty());

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.anularOrden(
                        99L,
                        crearRequest("Cancelar compra")
                )
        );

        assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode());
        verifyNoInteractions(consultaRecepciones);
    }

    @Test
    void debeRechazarIdentificadorInvalido() {
        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.anularOrden(
                        -1L,
                        crearRequest("Cancelar compra")
                )
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verifyNoInteractions(repository);
        verifyNoInteractions(consultaRecepciones);
    }

    @Test
    void debeRechazarOrdenCerrada() {
        OrdenCompra orden = crearOrden("CERRADA");
        prepararOrden(orden);

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.anularOrden(
                        11L,
                        crearRequest("Cancelar compra")
                )
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        assertEquals("CERRADA", orden.getEstado());

        verifyNoInteractions(consultaRecepciones);
        verify(repository, never())
                .saveAndFlush(any(OrdenCompra.class));
    }

    @Test
    void debeBloquearSiServicioRecepcionNoResponde() {
        OrdenCompra orden = crearOrden("APROBADA");
        prepararOrden(orden);

        when(consultaRecepciones.tieneRecepciones(11L))
                .thenThrow(new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "No se pudo consultar el servicio de Recepcion"
                ));

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.anularOrden(
                        11L,
                        crearRequest("Cancelar compra")
                )
        );

        assertEquals(HttpStatus.BAD_GATEWAY, error.getStatusCode());
        assertEquals("APROBADA", orden.getEstado());
        assertNull(orden.getFechaAnulacion());

        verify(repository, never())
                .saveAndFlush(any(OrdenCompra.class));
    }
}
