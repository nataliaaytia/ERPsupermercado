package com.sonic.erp.proveedores.service;

import com.sonic.erp.proveedores.dto.request.DescuentoCantidadRequest;
import com.sonic.erp.proveedores.dto.response.DescuentoCantidadResponse;
import com.sonic.erp.proveedores.entity.CatalogoComercial;
import com.sonic.erp.proveedores.entity.DescuentoCantidad;
import com.sonic.erp.proveedores.repository.CatalogoComercialRepository;
import com.sonic.erp.proveedores.repository.DescuentoCantidadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DescuentoCantidadService {

    private final DescuentoCantidadRepository descuentoRepository;
    private final CatalogoComercialRepository catalogoComercialRepository;

    @Transactional
    public DescuentoCantidadResponse registrarDescuento(DescuentoCantidadRequest request) {
        if (request.getCantidadMaxima() != null && request.getCantidadMaxima() < request.getCantidadMinima()) {
            throw new IllegalArgumentException("La cantidad maxima no puede ser menor a la cantidad minima");
        }
        CatalogoComercial catalogo = catalogoComercialRepository.findById(request.getIdCatalogo())
                .orElseThrow(() -> new IllegalArgumentException("No se encontro el catalogo comercial con ID: " + request.getIdCatalogo()));

        DescuentoCantidad descuento = DescuentoCantidad.builder()
                .catalogoComercial(catalogo)
                .cantidadMinima(request.getCantidadMinima())
                .cantidadMaxima(request.getCantidadMaxima())
                .porcentajeDescuento(request.getPorcentajeDescuento())
                .build();

        DescuentoCantidad guardado = descuentoRepository.save(descuento);

        return DescuentoCantidadResponse.builder()
                .idDescuento(guardado.getIdDescuento())
                .idCatalogo(guardado.getCatalogoComercial().getIdCatalogo())
                .cantidadMinima(guardado.getCantidadMinima())
                .cantidadMaxima(guardado.getCantidadMaxima())
                .porcentajeDescuento(guardado.getPorcentajeDescuento())
                .build();
    }

    public List<DescuentoCantidadResponse> listarPorCatalogo(Long idCatalogo) {
        if (!catalogoComercialRepository.existsById(idCatalogo)) {
            throw new IllegalArgumentException("No se encontro el catalogo comercial con ID: " + idCatalogo);
        }

        return descuentoRepository.findByCatalogoComercial_IdCatalogo(idCatalogo).stream()
                .map(d -> DescuentoCantidadResponse.builder()
                        .idDescuento(d.getIdDescuento())
                        .idCatalogo(d.getCatalogoComercial().getIdCatalogo())
                        .cantidadMinima(d.getCantidadMinima())
                        .cantidadMaxima(d.getCantidadMaxima())
                        .porcentajeDescuento(d.getPorcentajeDescuento())
                        .build())
                .toList();
    }
}