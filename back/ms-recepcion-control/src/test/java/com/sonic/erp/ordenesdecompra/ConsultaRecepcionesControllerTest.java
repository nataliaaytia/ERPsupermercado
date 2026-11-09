
package com.sonic.erp.ordenesdecompra;

import com.sonic.erp.ordenesdecompra.controller.ConsultaRecepcionesController;
import com.sonic.erp.ordenesdecompra.repository.RecepcionRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ConsultaRecepcionesControllerTest {

    private RecepcionRepository repository;
    private ConsultaRecepcionesController controller;

    @BeforeEach
    void preparar() {
        repository = mock(RecepcionRepository.class);
        controller = new ConsultaRecepcionesController(repository);
    }

    @Test
    void debeInformarCuandoNoExistenRecepciones() {
        when(repository.existsByIdOrdenIsNull()).thenReturn(false);
        when(repository.existsByIdOrden(11L)).thenReturn(false);

        var resultado = controller.consultarExistencia(11L);

        assertFalse(resultado.tieneRecepciones());
        verify(repository).existsByIdOrden(11L);
    }

    @Test
    void debeDetectarRecepcionesRegistradas() {
        when(repository.existsByIdOrdenIsNull()).thenReturn(false);
        when(repository.existsByIdOrden(11L)).thenReturn(true);

        var resultado = controller.consultarExistencia(11L);

        assertTrue(resultado.tieneRecepciones());
        verify(repository).existsByIdOrden(11L);
    }

    @Test
    void debeBloquearSiHayRecepcionesSinOrden() {
        when(repository.existsByIdOrdenIsNull()).thenReturn(true);

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> controller.consultarExistencia(11L)
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());

        verify(repository, never()).existsByIdOrden(11L);
    }

    @Test
    void debeRechazarIdentificadorInvalido() {
        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> controller.consultarExistencia(-1L)
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verifyNoInteractions(repository);
    }

    @Test
    void debeRechazarIdentificadorNulo() {
        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> controller.consultarExistencia(null)
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verifyNoInteractions(repository);
    }
}
