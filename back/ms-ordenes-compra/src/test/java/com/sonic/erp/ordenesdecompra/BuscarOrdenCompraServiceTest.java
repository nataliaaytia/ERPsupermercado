
package com.sonic.erp.ordenesdecompra;

import com.sonic.erp.ordenesdecompra.dto.response.OrdenCompraResumenResponse;
import com.sonic.erp.ordenesdecompra.entity.OrdenCompra;
import com.sonic.erp.ordenesdecompra.repository.OrdenCompraRepository;
import com.sonic.erp.ordenesdecompra.service.OrdenCompraService;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class BuscarOrdenCompraServiceTest {

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
        return OrdenCompra.builder()
                .idOrden(1L)
                .numero("OC-4DB0-PRUEBA")
                .idOferta(11L)
                .proveedorId(1L)
                .fecha(LocalDate.of(2026, 11, 8))
                .estado("BORRADOR")
                .total(new BigDecimal("387.50"))
                .build();
    }

    @Test
    void debeBuscarConFiltrosCombinados() {
        Page<OrdenCompra> pagina = new PageImpl<>(
                List.of(crearOrden()),
                PageRequest.of(0, 10),
                1
        );

        when(repository.findAll(
                any(Specification.class),
                any(Pageable.class)
        )).thenReturn(pagina);

        Page<OrdenCompraResumenResponse> resultado =
                service.buscarOrdenes(
                        "  OC-4DB0  ",
                        1L,
                        "borrador",
                        0,
                        10
                );

        assertEquals(1, resultado.getTotalElements());
        assertEquals(1L, resultado.getContent().get(0).idOrden());
        assertEquals(1L, resultado.getContent().get(0).proveedorId());
        assertEquals("BORRADOR",
                resultado.getContent().get(0).estado());

        // Comprobar que los tres filtros se construyen
        var captor = org.mockito.ArgumentCaptor
                .forClass(Specification.class);

        verify(repository).findAll(
                captor.capture(),
                any(Pageable.class)
        );

        @SuppressWarnings("unchecked")
        Specification<OrdenCompra> filtros =
                (Specification<OrdenCompra>) captor.getValue();

        Root<OrdenCompra> root = mock(Root.class);
        CriteriaQuery<?> query = mock(CriteriaQuery.class);
        CriteriaBuilder cb = mock(CriteriaBuilder.class);

        Path<String> rutaNumero = mock(Path.class);
        Path<Long> rutaProveedor = mock(Path.class);
        Path<String> rutaEstado = mock(Path.class);

        Expression<String> numeroMinusculo = mock(Expression.class);
        Expression<String> estadoMayusculo = mock(Expression.class);

        when(root.<String>get("numero")).thenReturn(rutaNumero);
        when(root.<Long>get("proveedorId")).thenReturn(rutaProveedor);
        when(root.<String>get("estado")).thenReturn(rutaEstado);

        when(cb.lower(rutaNumero)).thenReturn(numeroMinusculo);
        when(cb.upper(rutaEstado)).thenReturn(estadoMayusculo);
        when(cb.conjunction()).thenReturn(mock(Predicate.class));

        filtros.toPredicate(root, query, cb);

        verify(cb).like(numeroMinusculo, "%oc-4db0%");
        verify(cb).equal(rutaProveedor, 1L);
        verify(cb).equal(estadoMayusculo, "BORRADOR");
    }

    @Test
    void debeDevolverResultadosVacios() {
        Page<OrdenCompra> pagina = new PageImpl<>(
                List.of(),
                PageRequest.of(0, 10),
                0
        );

        when(repository.findAll(
                any(Specification.class),
                any(Pageable.class)
        )).thenReturn(pagina);

        Page<OrdenCompraResumenResponse> resultado =
                service.buscarOrdenes(
                        null, 99999L, "BORRADOR", 0, 10
                );

        assertTrue(resultado.isEmpty());
        assertEquals(0, resultado.getTotalElements());
        assertEquals(0, resultado.getTotalPages());
    }

    @Test
    void debeRespetarLaPaginacion() {
        Page<OrdenCompra> pagina = new PageImpl<>(
                List.of(),
                PageRequest.of(1, 1),
                1
        );

        when(repository.findAll(
                any(Specification.class),
                any(Pageable.class)
        )).thenReturn(pagina);

        Page<OrdenCompraResumenResponse> resultado =
                service.buscarOrdenes(
                        null, null, null, 1, 1
                );

        assertTrue(resultado.isEmpty());
        assertEquals(1, resultado.getTotalElements());
        assertEquals(1, resultado.getTotalPages());
        assertEquals(1, resultado.getNumber());


        verify(repository).findAll(
                any(Specification.class),
                argThat((Pageable p) ->
                        p.getPageNumber() == 1 &&
                                p.getPageSize() == 1 &&
                                p.getSort().isSorted()
                )
        );
    }

    @Test
    void debeRechazarPaginaNegativa() {
        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.buscarOrdenes(
                        null, null, null, -1, 10
                )
        );

        assertEquals(HttpStatus.BAD_REQUEST,
                error.getStatusCode());

        verifyNoInteractions(repository);
    }

    @Test
    void debeRechazarTamanoInvalido() {
        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.buscarOrdenes(
                        null, null, null, 0, 101
                )
        );

        assertEquals(HttpStatus.BAD_REQUEST,
                error.getStatusCode());

        verifyNoInteractions(repository);
    }

    @Test
    void debeRechazarProveedorInvalido() {
        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.buscarOrdenes(
                        null, -5L, null, 0, 10
                )
        );

        assertEquals(HttpStatus.BAD_REQUEST,
                error.getStatusCode());

        verifyNoInteractions(repository);
    }
}
