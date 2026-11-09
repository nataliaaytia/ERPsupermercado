
package com.sonic.erp.ordenesdecompra;

import com.sonic.erp.ordenesdecompra.entity.DetalleOrdenCompra;
import com.sonic.erp.ordenesdecompra.entity.OrdenCompra;
import com.sonic.erp.ordenesdecompra.repository.OrdenCompraRepository;
import com.sonic.erp.ordenesdecompra.service.OrdenCompraService;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class HistorialDevolucionIntegracionTest {

    @Autowired
    private OrdenCompraRepository repository;

    @Autowired
    private OrdenCompraService service;

    @Autowired
    private EntityManager entityManager;

    @Test
    void debeGuardarYRecuperarHistorialEnPostgreSQL() {

        OrdenCompra orden = OrdenCompra.builder()
                .idOferta(System.nanoTime())
                .proveedorId(1L)
                .numero("OC-TEST-" + UUID.randomUUID())
                .fecha(LocalDate.now())
                .estado("BORRADOR")
                .total(new BigDecimal("100.00"))
                .build();

        DetalleOrdenCompra detalle =
                DetalleOrdenCompra.builder()
                        .productoId(101L)
                        .cantidad(2)
                        .precio(new BigDecimal("50.00"))
                        .subtotal(new BigDecimal("100.00"))
                        .build();

        orden.agregarDetalle(detalle);

        OrdenCompra guardada =
                repository.saveAndFlush(orden);

        Long idOrden = guardada.getIdOrden();

        service.solicitarAprobacion(idOrden);

        service.devolverParaCorreccion(
                idOrden,
                "Corregir cantidad"
        );

        entityManager.flush();
        entityManager.clear();

        OrdenCompra recuperada = repository.findById(idOrden)
                .orElseThrow();

        assertEquals("BORRADOR", recuperada.getEstado());

        assertEquals(
                "Corregir cantidad",
                recuperada.getObservacion()
        );

        assertEquals(
                1,
                recuperada.getHistorialDevoluciones().size()
        );

        var devolucion =
                recuperada.getHistorialDevoluciones().get(0);

        assertEquals(
                "Corregir cantidad",
                devolucion.getMotivo()
        );

        assertEquals(
                "SIN_AUTENTICACION",
                devolucion.getResponsable()
        );

        assertNotNull(devolucion.getFechaDevolucion());
    }
}
