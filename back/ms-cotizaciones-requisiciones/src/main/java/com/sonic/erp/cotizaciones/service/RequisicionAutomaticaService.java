package com.sonic.erp.cotizaciones.service;

import com.sonic.erp.cotizaciones.dto.request.AlertaInventario;
import com.sonic.erp.cotizaciones.entity.DetalleRequisicion;
import com.sonic.erp.cotizaciones.entity.Requisicion;
import com.sonic.erp.cotizaciones.repository.RequisicionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;

@Service
public class RequisicionAutomaticaService {

    private final RequisicionRepository requisicionRepository;

    public RequisicionAutomaticaService(RequisicionRepository requisicionRepository) {
        this.requisicionRepository = requisicionRepository;
    }

    @Transactional
    public Requisicion procesarAlertaInventario(AlertaInventario alerta) {
        if (alerta.getIdAlerta() == null || alerta.getProductoId() == null || alerta.getCantidadSugerida() == null) {
            throw new IllegalArgumentException("Datos incompletos en la alerta de inventario");
        }

        if (requisicionRepository.existsByAlertaId(alerta.getIdAlerta())) {
            System.out.println("Alerta " + alerta.getIdAlerta() + " ya fue procesada previamente.");
            return requisicionRepository.findByAlertaId(alerta.getIdAlerta()).orElse(null);
        }

        Requisicion requisicion = Requisicion.builder()
                .fecha(LocalDate.now())
                .prioridad(alerta.getPrioridad() != null ? alerta.getPrioridad() : "ALTA")
                .estado("PENDIENTE")
                .solicitante("SISTEMA_INVENTARIOS")
                .observacion(alerta.getMotivo() != null ? alerta.getMotivo() : "Generada automáticamente por alerta de stock")
                .alertaId(alerta.getIdAlerta())
                .origen("INVENTARIO_PUB_SUB")
                .detalles(new ArrayList<>())
                .build();

        DetalleRequisicion detalle = DetalleRequisicion.builder()
                .productoId(alerta.getProductoId())
                .cantidad(alerta.getCantidadSugerida())
                .observacion("Item generado desde alerta " + alerta.getIdAlerta())
                .requisicion(requisicion)
                .build();

        requisicion.getDetalles().add(detalle);

        Requisicion guardada = requisicionRepository.save(requisicion);
        System.out.println("Requisición creada exitosamente con ID: " + guardada.getIdRequisicion() + " para alerta: " + alerta.getIdAlerta());

        return guardada;
    }
}