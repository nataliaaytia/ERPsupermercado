package com.sonic.erp.cotizaciones.service;

import com.sonic.erp.cotizaciones.dto.request.AlertaInventario;
import com.sonic.erp.cotizaciones.entity.DetalleRequisicion;
import com.sonic.erp.cotizaciones.entity.Requisicion;
import com.sonic.erp.cotizaciones.exception.AlertaDuplicadaException;
import com.sonic.erp.cotizaciones.repository.RequisicionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Optional;

@Service
public class RequisicionAutomaticaService {

    private final RequisicionRepository requisicionRepository;

    public RequisicionAutomaticaService(RequisicionRepository requisicionRepository) {
        this.requisicionRepository = requisicionRepository;
    }

    @Transactional
    public Requisicion procesarAlertaInventario(AlertaInventario alerta) {
        if (alerta.getIdAlerta() == null || alerta.getProductoId() == null || alerta.getCantidadSugerida() == null) {
            throw new IllegalArgumentException("Datos obligatorios incompletos en la alerta recibida");
        }

        Optional<Requisicion> requisicionPrevia = requisicionRepository.findByAlertaId(alerta.getIdAlerta());
        if (requisicionPrevia.isPresent()) {
            System.out.println("Control de duplicados: La alerta " + alerta.getIdAlerta()
                    + " ya generó la Requisición #" + requisicionPrevia.get().getIdRequisicion());

            throw new AlertaDuplicadaException(alerta.getIdAlerta(), requisicionPrevia.get().getIdRequisicion());
        }
        Requisicion requisicion = Requisicion.builder()
                .fecha(LocalDate.now())
                .prioridad(alerta.getPrioridad() != null ? alerta.getPrioridad() : "ALTA")
                .estado("PENDIENTE")
                .solicitante("SISTEMA_INVENTARIOS")
                .observacion(alerta.getMotivo() != null ? alerta.getMotivo() : "Generada automáticamente desde alerta")
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
        return requisicionRepository.save(requisicion);
    }
}