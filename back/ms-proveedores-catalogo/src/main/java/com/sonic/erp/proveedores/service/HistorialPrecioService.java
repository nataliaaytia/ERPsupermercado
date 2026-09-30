package com.sonic.erp.proveedores.service;

import com.sonic.erp.proveedores.dto.response.HistorialPrecioResponse;
import com.sonic.erp.proveedores.entity.CatalogoComercial;
import com.sonic.erp.proveedores.entity.HistorialPrecio;
import com.sonic.erp.proveedores.repository.CatalogoComercialRepository;
import com.sonic.erp.proveedores.repository.HistorialPrecioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HistorialPrecioService {

    private final HistorialPrecioRepository historialRepository;
    private final CatalogoComercialRepository catalogoComercialRepository;

    @Transactional(readOnly = true)
    public List<HistorialPrecioResponse> consultarHistorial(Long idProveedor, Long idProducto) {
        List<HistorialPrecio> registros = historialRepository
                .findByCatalogoComercial_Proveedor_IdProveedorAndCatalogoComercial_Producto_IdProductoOrderByFechaCambioDesc(
                        idProveedor, idProducto);

        return registros.stream()
                .map(this::mapearADto)
                .toList();
    }

    @Transactional
    public void registrarNuevoPrecio(CatalogoComercial catalogo, BigDecimal precio, String motivo) {
        HistorialPrecio nuevoRegistro = HistorialPrecio.builder()
                .catalogoComercial(catalogo)
                .precio(precio)
                .fechaCambio(LocalDateTime.now())
                .motivo(motivo)
                .build();
        historialRepository.save(nuevoRegistro);
    }

    private HistorialPrecioResponse mapearADto(HistorialPrecio h) {
        return HistorialPrecioResponse.builder()
                .idHistorial(h.getIdHistorial())
                .idProveedor(h.getCatalogoComercial().getProveedor().getIdProveedor())
                .nombreProveedor(h.getCatalogoComercial().getProveedor().getRazonSocial())
                .idProducto(h.getCatalogoComercial().getProducto().getIdProducto())
                .nombreProducto(h.getCatalogoComercial().getProducto().getDescripcion())
                .precio(h.getPrecio())
                .fechaCambio(h.getFechaCambio())
                .motivo(h.getMotivo())
                .build();
    }
}