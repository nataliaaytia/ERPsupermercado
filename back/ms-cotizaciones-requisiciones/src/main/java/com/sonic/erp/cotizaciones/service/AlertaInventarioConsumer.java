package com.sonic.erp.cotizaciones.service;

import com.sonic.erp.cotizaciones.dto.request.AlertaInventario;
import com.sonic.erp.cotizaciones.entity.Requisicion;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.CompletableFuture;

@Service
public class AlertaInventarioConsumer {

    private final RequisicionAutomaticaService requisicionAutomaticaService;

    public AlertaInventarioConsumer(RequisicionAutomaticaService requisicionAutomaticaService) {
        this.requisicionAutomaticaService = requisicionAutomaticaService;
    }

    @Async
    public CompletableFuture<Requisicion> consumirAlertaAsincrona(AlertaInventario alerta) {
        String horaRecepcion = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

        System.out.println("==================================================");
        System.out.println("[CONSUMIDOR ASÍNCRONO] Recibiendo evento de reposición...");
        System.out.println("Hora recepción: " + horaRecepcion);
        System.out.println("Alerta ID: " + alerta.getIdAlerta());
        System.out.println("Producto: " + alerta.getProductoId() + " | Cantidad: " + alerta.getCantidadSugerida());
        System.out.println("Hilo de ejecución: " + Thread.currentThread().getName());
        System.out.println("==================================================");

        try {
            Thread.sleep(300);
            Requisicion requisicion = requisicionAutomaticaService.procesarAlertaInventario(alerta);

            System.out.println("[CONSUMIDOR ASÍNCRONO] Requisición #" + requisicion.getIdRequisicion() + " registrada con éxito.");
            return CompletableFuture.completedFuture(requisicion);

        } catch (Exception e) {
            System.err.println("[CONSUMIDOR ASÍNCRONO] Error al procesar alerta: " + e.getMessage());
            return CompletableFuture.failedFuture(e);
        }
    }
}