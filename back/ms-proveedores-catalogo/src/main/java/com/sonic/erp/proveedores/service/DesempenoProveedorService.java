package com.sonic.erp.proveedores.service;

import com.sonic.erp.proveedores.dto.response.DesempenoProveedorResponse;
import com.sonic.erp.proveedores.entity.EvaluacionProveedor;
import com.sonic.erp.proveedores.entity.IncidenciaProveedor;
import com.sonic.erp.proveedores.entity.Proveedor;
import com.sonic.erp.proveedores.repository.EvaluacionProveedorRepository;
import com.sonic.erp.proveedores.repository.IncidenciaProveedorRepository;
import com.sonic.erp.proveedores.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DesempenoProveedorService {

    private final ProveedorRepository proveedorRepository;
    private final EvaluacionProveedorRepository evaluacionProveedorRepository;
    private final IncidenciaProveedorRepository incidenciaProveedorRepository;

    public DesempenoProveedorResponse obtenerDesempeno(Long idProveedor) {

        Proveedor proveedor = proveedorRepository.findById(idProveedor)
                .orElseThrow(() ->
                        new RuntimeException("Proveedor no encontrado")
                );

        List<EvaluacionProveedor> evaluaciones =
                evaluacionProveedorRepository
                        .findByProveedorIdProveedorOrderByFechaDesc(idProveedor);

        List<IncidenciaProveedor> incidencias =
                incidenciaProveedorRepository
                        .findByProveedor_IdProveedor(idProveedor);

        Double promedioPuntaje = calcularPromedioPuntaje(evaluaciones);

        EvaluacionProveedor ultimaEvaluacion =
                obtenerUltimaEvaluacion(evaluaciones);

        IncidenciaProveedor ultimaIncidencia =
                obtenerUltimaIncidencia(incidencias);

        return DesempenoProveedorResponse.builder()
                .idProveedor(proveedor.getIdProveedor())
                .razonSocial(proveedor.getRazonSocial())
                .promedioPuntaje(promedioPuntaje)
                .totalEvaluaciones(evaluaciones.size())
                .totalIncidencias(incidencias.size())
                .fechaUltimaEvaluacion(
                        ultimaEvaluacion != null
                                ? ultimaEvaluacion.getFecha()
                                : null
                )
                .comentarioUltimaEvaluacion(
                        ultimaEvaluacion != null
                                ? ultimaEvaluacion.getComentario()
                                : null
                )
                .tipoUltimaIncidencia(
                        ultimaIncidencia != null
                                ? ultimaIncidencia.getTipo()
                                : null
                )
                .build();
    }

    private Double calcularPromedioPuntaje(
            List<EvaluacionProveedor> evaluaciones) {

        if (evaluaciones.isEmpty()) {
            return 0.0;
        }

        return evaluaciones.stream()
                .filter(evaluacion -> evaluacion.getPuntaje() != null)
                .mapToInt(EvaluacionProveedor::getPuntaje)
                .average()
                .orElse(0.0);
    }

    private EvaluacionProveedor obtenerUltimaEvaluacion(
            List<EvaluacionProveedor> evaluaciones) {

        if (evaluaciones.isEmpty()) {
            return null;
        }

        return evaluaciones.get(0);
    }

    private IncidenciaProveedor obtenerUltimaIncidencia(
            List<IncidenciaProveedor> incidencias) {

        if (incidencias.isEmpty()) {
            return null;
        }

        return incidencias.get(0);
    }
}