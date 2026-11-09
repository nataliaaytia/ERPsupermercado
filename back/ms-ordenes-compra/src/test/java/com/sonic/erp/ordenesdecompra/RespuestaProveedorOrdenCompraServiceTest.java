
package com.sonic.erp.ordenesdecompra;

import com.sonic.erp.ordenesdecompra.dto.request.RegistrarRespuestaProveedorRequest;
import com.sonic.erp.ordenesdecompra.entity.OrdenCompra;
import com.sonic.erp.ordenesdecompra.repository.OrdenCompraRepository;
import com.sonic.erp.ordenesdecompra.service.RespuestaProveedorOrdenCompraService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class RespuestaProveedorOrdenCompraServiceTest {

    private OrdenCompraRepository repository;
    private RespuestaProveedorOrdenCompraService service;

    @BeforeEach
    void preparar() {
        repository = mock(OrdenCompraRepository.class);
        service = new RespuestaProveedorOrdenCompraService(repository);
    }

    private OrdenCompra crearOrden(String estado) {
        return OrdenCompra.builder()
                .idOrden(1L)
                .numero("OC-PRUEBA-520")
                .estado(estado)
                .build();
    }

    private RegistrarRespuestaProveedorRequest crearRequest(
            String respuesta) {

        return new RegistrarRespuestaProveedorRequest(
                respuesta,
                "CORREO-2026-001",
                "CORREO",
                "El proveedor confirma su respuesta."
        );
    }

    private void prepararOrden(OrdenCompra orden) {
        when(repository.findByIdForUpdate(1L))
                .thenReturn(Optional.of(orden));
    }

    @Test
    void debeRegistrarAceptacionCorrectamente() {
        OrdenCompra orden = crearOrden("ENVIADA");
        prepararOrden(orden);

        var resultado = service.registrarRespuesta(
                1L, crearRequest("ACEPTADA"));

        assertEquals("ACEPTADA_PROVEEDOR", orden.getEstado());
        assertEquals("ACEPTADA", resultado.respuesta());
        assertEquals("CORREO-2026-001", resultado.referencia());
        assertEquals("CORREO", resultado.origen());
        assertFalse(resultado.yaRegistrada());
        assertNotNull(resultado.fechaRespuesta());

        assertNotNull(orden.getRespuestaProveedor());
        assertSame(
                orden,
                orden.getRespuestaProveedor().getOrdenCompra()
        );

        verify(repository).saveAndFlush(orden);
    }

    @Test
    void debeRegistrarRechazoCorrectamente() {
        OrdenCompra orden = crearOrden("ENVIADA");
        prepararOrden(orden);

        var resultado = service.registrarRespuesta(
                1L, crearRequest("RECHAZADA"));

        assertEquals("RECHAZADA_PROVEEDOR", orden.getEstado());
        assertEquals("RECHAZADA", resultado.respuesta());
        assertFalse(resultado.yaRegistrada());
        assertNotNull(resultado.fechaRespuesta());

        verify(repository).saveAndFlush(orden);
    }

    @Test
    void debePermitirRepetirRespuestaIdenticaSinDuplicar() {
        OrdenCompra orden = crearOrden("ENVIADA");
        prepararOrden(orden);

        var request = crearRequest("ACEPTADA");

        var primera = service.registrarRespuesta(1L, request);
        var segunda = service.registrarRespuesta(1L, request);

        assertFalse(primera.yaRegistrada());
        assertTrue(segunda.yaRegistrada());

        assertEquals(
                primera.fechaRespuesta(),
                segunda.fechaRespuesta()
        );

        assertEquals("ACEPTADA_PROVEEDOR", orden.getEstado());

        verify(repository, times(1)).saveAndFlush(orden);
    }

    @Test
    void debeRechazarRespuestaContradictoria() {
        OrdenCompra orden = crearOrden("ENVIADA");
        prepararOrden(orden);

        service.registrarRespuesta(
                1L, crearRequest("ACEPTADA"));

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.registrarRespuesta(
                        1L, crearRequest("RECHAZADA"))
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        assertEquals("ACEPTADA_PROVEEDOR", orden.getEstado());
        assertEquals(
                "ACEPTADA",
                orden.getRespuestaProveedor().getRespuesta()
        );

        verify(repository, times(1)).saveAndFlush(orden);
    }

    @Test
    void debeRechazarOrdenEnBorrador() {
        OrdenCompra orden = crearOrden("BORRADOR");
        prepararOrden(orden);

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.registrarRespuesta(
                        1L, crearRequest("ACEPTADA"))
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        assertEquals("BORRADOR", orden.getEstado());
        assertNull(orden.getRespuestaProveedor());

        verify(repository, never())
                .saveAndFlush(any(OrdenCompra.class));
    }

    @Test
    void debeRechazarOrdenInexistente() {
        when(repository.findByIdForUpdate(67L))
                .thenReturn(Optional.empty());

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.registrarRespuesta(
                        67L, crearRequest("ACEPTADA"))
        );

        assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode());

        verify(repository, never())
                .saveAndFlush(any(OrdenCompra.class));
    }

    @Test
    void debeRechazarIdentificadorInvalido() {
        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.registrarRespuesta(
                        -1L, crearRequest("ACEPTADA"))
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verifyNoInteractions(repository);
    }

    @Test
    void debeRechazarRespuestaInvalida() {
        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.registrarRespuesta(
                        1L, crearRequest("PENDIENTE"))
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verifyNoInteractions(repository);
    }

    @Test
    void debeRechazarReferenciaVacia() {
        var request = new RegistrarRespuestaProveedorRequest(
                "ACEPTADA",
                "   ",
                "CORREO",
                "Prueba"
        );

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.registrarRespuesta(1L, request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verifyNoInteractions(repository);
    }

    @Test
    void debeRechazarOrigenInvalido() {
        var request = new RegistrarRespuestaProveedorRequest(
                "ACEPTADA",
                "REF-001",
                "FAX",
                "Prueba"
        );

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.registrarRespuesta(1L, request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verifyNoInteractions(repository);
    }

    @Test
    void debeRechazarObservacionDemasiadoLarga() {
        var request = new RegistrarRespuestaProveedorRequest(
                "ACEPTADA",
                "REF-001",
                "CORREO",
                "x".repeat(501)
        );

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.registrarRespuesta(1L, request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verifyNoInteractions(repository);
    }
}
