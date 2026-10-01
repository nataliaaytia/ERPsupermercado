package com.sonic.erp.proveedores.service;

import com.sonic.erp.proveedores.dto.response.CumplimientoPlazosResponse;
import com.sonic.erp.proveedores.dto.response.ProductosDefectuososResponse;
import com.sonic.erp.proveedores.dto.response.RankingProveedorResponse;
import com.sonic.erp.proveedores.entity.Proveedor;
import com.sonic.erp.proveedores.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RankingProveedorService {

    private final ProveedorRepository proveedorRepository;
    private final CumplimientoProveedorService cumplimientoProveedorService;
    private final ProductosDefectuososService productosDefectuososService;

    public List<RankingProveedorResponse> obtenerRanking(String criterio, String orden) {
        List<Proveedor> proveedores = proveedorRepository.findAll();
        List<RankingProveedorResponse> listaRanking = new ArrayList<>();

        for (Proveedor p : proveedores) {
            CumplimientoPlazosResponse cumplimiento =
                    cumplimientoProveedorService.consultarCumplimientoPlazos(p.getIdProveedor());

            ProductosDefectuososResponse defectuosos =
                    productosDefectuososService.obtenerProductosDefectuosos(p.getIdProveedor());

            RankingProveedorResponse item = RankingProveedorResponse.builder()
                    .idProveedor(p.getIdProveedor())
                    .nombreProveedor(p.getRazonSocial())
                    .porcentajeEntregasATiempo(
                            BigDecimal.valueOf(cumplimiento.getPorcentajeEntregasATiempo())
                                    .setScale(2, RoundingMode.HALF_UP)
                    )
                    .cantidadDefectuosos((long) defectuosos.getTotalProductosDefectuosos())
                    .promedioPrecios(BigDecimal.ZERO)
                    .build();

            listaRanking.add(item);
        }

        Comparator<RankingProveedorResponse> comparador;
        switch (criterio.toUpperCase()) {
            case "CALIDAD":
                // Menos productos defectuosos = mejor posición
                comparador = Comparator.comparing(RankingProveedorResponse::getCantidadDefectuosos);
                break;
            case "PRECIO":
                comparador = Comparator.comparing(RankingProveedorResponse::getPromedioPrecios);
                break;
            case "ENTREGAS":
            default:
                comparador = Comparator.comparing(RankingProveedorResponse::getPorcentajeEntregasATiempo).reversed();
                break;
        }

        if ("ASC".equalsIgnoreCase(orden) && criterio.equalsIgnoreCase("ENTREGAS")) {
            comparador = comparador.reversed();
        } else if ("DESC".equalsIgnoreCase(orden) && !criterio.equalsIgnoreCase("ENTREGAS")) {
            comparador = comparador.reversed();
        }

        listaRanking.sort(comparador);
        for (int i = 0; i < listaRanking.size(); i++) {
            listaRanking.get(i).setPosicionRanking(i + 1);
        }

        return listaRanking;
    }
}