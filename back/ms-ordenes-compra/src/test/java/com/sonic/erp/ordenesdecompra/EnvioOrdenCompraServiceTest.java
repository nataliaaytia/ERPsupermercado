
package com.sonic.erp.ordenesdecompra;

import com.sonic.erp.ordenesdecompra.entity.OrdenCompra;
import com.sonic.erp.ordenesdecompra.repository.OrdenCompraRepository;
import com.sonic.erp.ordenesdecompra.service.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class EnvioOrdenCompraServiceTest {

    private OrdenCompraRepository repository;
    private ConsultaProveedorOrdenService proveedores;
    private PdfOrdenCompraService pdfService;
    private CorreoOrdenCompraService correoService;
    private EnvioOrdenCompraService service;

    @BeforeEach
    void preparar() {
        repository = mock(OrdenCompraRepository.class);
        proveedores = mock(ConsultaProveedorOrdenService.class);
        pdfService = mock(PdfOrdenCompraService.class);
        correoService = mock(CorreoOrdenCompraService.class);

        service = new EnvioOrdenCompraService(
                repository,
                proveedores,
                pdfService,
                correoService
        );
    }

    private OrdenCompra crearOrdenAprobada() {
        return OrdenCompra.builder()
                .idOrden(1L)
                .numero("OC-PRUEBA-001")
                .idOferta(11L)
                .proveedorId(1L)
                .estado("APROBADA")
                .total(new BigDecimal("387.50"))
                .build();
    }

    private void prepararEnvio(OrdenCompra orden) {
        when(repository.findByIdForUpdate(1L))
                .thenReturn(Optional.of(orden));

        when(repository.saveAndFlush(any(OrdenCompra.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        when(proveedores.obtenerContacto(1L))
                .thenReturn(
                        new ConsultaProveedorOrdenService.ProveedorContacto(
                                1L,
                                "Distribuidora La Paz",
                                "contacto@distribuidoralapaz.com"
                        )
                );

        when(pdfService.generarPdf(orden))
                .thenReturn(new byte[]{1, 2, 3});
    }

    @Test
    void debeEnviarOrdenCorrectamente() {
        OrdenCompra orden = crearOrdenAprobada();
        prepararEnvio(orden);

        var resultado = service.enviarOrden(1L);

        assertEquals("ENVIADA", resultado.estadoOrden());
        assertEquals("ACEPTADO_POR_SMTP", resultado.resultado());
        assertNull(resultado.detalleError());

        assertEquals(1, orden.getHistorialEnvios().size());
        assertEquals(
                "ACEPTADO_POR_SMTP",
                orden.getHistorialEnvios().get(0).getEstadoResultado()
        );
        assertNotNull(
                orden.getHistorialEnvios().get(0).getFechaAceptacion()
        );

        verify(correoService, times(1))
                .enviarOrden(
                        anyString(),
                        anyString(),
                        anyString(),
                        any(byte[].class)
                );

        verify(repository).saveAndFlush(orden);
    }

    @Test
    void debeRegistrarFalloSinCambiarEstado() {
        OrdenCompra orden = crearOrdenAprobada();
        prepararEnvio(orden);

        doThrow(new IllegalStateException("SMTP no disponible"))
                .when(correoService)
                .enviarOrden(
                        anyString(),
                        anyString(),
                        anyString(),
                        any(byte[].class)
                );

        var resultado = service.enviarOrden(1L);

        assertEquals("APROBADA", resultado.estadoOrden());
        assertEquals("FALLIDO", resultado.resultado());
        assertEquals("SMTP no disponible", resultado.detalleError());

        assertEquals(1, orden.getHistorialEnvios().size());
        assertEquals(
                "FALLIDO",
                orden.getHistorialEnvios().get(0).getEstadoResultado()
        );

        verify(repository).saveAndFlush(orden);
    }

    @Test
    void debePermitirReintentoDespuesDeFallo() {
        OrdenCompra orden = crearOrdenAprobada();
        prepararEnvio(orden);

        doThrow(new IllegalStateException("Fallo temporal"))
                .doNothing()
                .when(correoService)
                .enviarOrden(
                        anyString(),
                        anyString(),
                        anyString(),
                        any(byte[].class)
                );

        var primerIntento = service.enviarOrden(1L);
        var segundoIntento = service.enviarOrden(1L);

        assertEquals("FALLIDO", primerIntento.resultado());
        assertEquals("ACEPTADO_POR_SMTP", segundoIntento.resultado());
        assertEquals("ENVIADA", orden.getEstado());
        assertEquals(2, orden.getHistorialEnvios().size());

        verify(repository, times(2)).saveAndFlush(orden);
    }

    @Test
    void debeImpedirEnvioDuplicado() {
        OrdenCompra orden = crearOrdenAprobada();
        prepararEnvio(orden);

        service.enviarOrden(1L);

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.enviarOrden(1L)
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());

        verify(correoService, times(1))
                .enviarOrden(
                        anyString(),
                        anyString(),
                        anyString(),
                        any(byte[].class)
                );

        verify(repository, times(1)).saveAndFlush(orden);
    }

    @Test
    void debeRechazarOrdenEnBorrador() {
        OrdenCompra orden = crearOrdenAprobada();
        orden.setEstado("BORRADOR");

        when(repository.findByIdForUpdate(1L))
                .thenReturn(Optional.of(orden));

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.enviarOrden(1L)
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());

        verifyNoInteractions(correoService);
        verify(repository, never())
                .saveAndFlush(any(OrdenCompra.class));
    }

    @Test
    void debeRechazarOrdenInexistente() {
        when(repository.findByIdForUpdate(999L))
                .thenReturn(Optional.empty());

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.enviarOrden(999L)
        );

        assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode());
        verifyNoInteractions(correoService);
    }

    @Test
    void debeRechazarIdentificadorInvalido() {
        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.enviarOrden(-1L)
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verifyNoInteractions(repository);
    }
}
