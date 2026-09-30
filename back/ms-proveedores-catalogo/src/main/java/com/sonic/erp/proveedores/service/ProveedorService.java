package com.sonic.erp.proveedores.service;

import com.sonic.erp.proveedores.dto.request.ProveedorCreateRequest;
import com.sonic.erp.proveedores.dto.request.ProveedorUpdateRequest;
import com.sonic.erp.proveedores.dto.response.ProveedorDetalleResponse;
import com.sonic.erp.proveedores.entity.CatalogoComercial;
import com.sonic.erp.proveedores.entity.Proveedor;
import com.sonic.erp.proveedores.repository.CatalogoComercialRepository;
import com.sonic.erp.proveedores.repository.ProveedorRepository;
import com.sonic.erp.proveedores.repository.IncidenciaProveedorRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.sonic.erp.proveedores.dto.response.ProveedorValidacionResponse;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;
import com.sonic.erp.proveedores.entity.CondicionComercial;
import com.sonic.erp.proveedores.repository.CondicionComercialRepository;
import java.util.Comparator;


@Service
@RequiredArgsConstructor

public class ProveedorService {

    private final ProveedorRepository proveedorRepository;
    private final CatalogoComercialRepository catalogoComercialRepository;
    private final CondicionComercialRepository condicionComercialRepository;
    private final IncidenciaProveedorRepository incidenciaProveedorRepository;

    @Transactional
    public Proveedor registrarProveedor(ProveedorCreateRequest request) {
        if (proveedorRepository.existsByNitRuc(request.getNitRuc())) {
            throw new IllegalArgumentException("Ya existe un proveedor con el mismo NIT o RUC");
        }
        Proveedor nuevoProveedor = Proveedor.builder()
                .nitRuc(request.getNitRuc())
                .razonSocial(request.getRazonSocial())
                .direccion(request.getDireccion())
                .telefono(request.getTelefono())
                .correo(request.getCorreo())
                .build();
        return proveedorRepository.save(nuevoProveedor);

    }


    @Transactional
    public Proveedor actualizarProveedor(Long id, ProveedorUpdateRequest request) {
        Proveedor proveedor = proveedorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No se encontro el proveedor con el ID: " + id));

        if (request.getNitRuc() != null && !request.getNitRuc().isBlank()) {
            if (proveedorRepository.existsByNitRucAndIdProveedorNot(request.getNitRuc(), id)) {
                throw new IllegalArgumentException("El NIT o RUC ya esta registrado para otro proveedor");
            }
            proveedor.setNitRuc(request.getNitRuc());
        }

        if (request.getRazonSocial() != null && !request.getRazonSocial().isBlank()) {
            proveedor.setRazonSocial(request.getRazonSocial());
        }

        if (request.getDireccion() != null && !request.getDireccion().isBlank()) {
            proveedor.setDireccion(request.getDireccion());
        }

        if (request.getTelefono() != null && !request.getTelefono().isBlank()) {
            proveedor.setTelefono(request.getTelefono());
        }

        if (request.getCorreo() != null && !request.getCorreo().isBlank()) {
            proveedor.setCorreo(request.getCorreo());
        }

        if (request.getEstado() != null && !request.getEstado().isBlank()) {
            proveedor.setEstado(request.getEstado());
        }

        return proveedorRepository.save(proveedor);
    }

    public ProveedorValidacionResponse validarProveedor(Long idProveedor) {

        Proveedor proveedor = proveedorRepository.findById(idProveedor)
                .orElseThrow(() ->
                        new IllegalArgumentException("Proveedor no encontrado"));

        List<String> errores = new ArrayList<>();

        if (proveedor.getNitRuc() == null || proveedor.getNitRuc().isBlank()) {
            errores.add("El NIT o RUC es obligatorio");
        }

        if (proveedor.getRazonSocial() == null || proveedor.getRazonSocial().isBlank()) {
            errores.add("La razon social es obligatoria");
        }

        if (proveedor.getDireccion() == null || proveedor.getDireccion().isBlank()) {
            errores.add("La direccion es obligatoria");
        }

        if (proveedor.getTelefono() == null || proveedor.getTelefono().isBlank()) {
            errores.add("El telefono es obligatorio");
        }

        if (proveedor.getCorreo() == null || proveedor.getCorreo().isBlank()) {
            errores.add("El correo es obligatorio");
        } else {
            String expresionCorreo = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";

            if (!Pattern.matches(expresionCorreo, proveedor.getCorreo())) {
                errores.add("El correo electronico no tiene un formato valido");
            }
        }

        boolean valido = errores.isEmpty();

        proveedor.setValidado(valido);
        proveedor.setFechaValidacion(LocalDateTime.now());
        proveedorRepository.save(proveedor);

        return ProveedorValidacionResponse.builder()
                .idProveedor(proveedor.getIdProveedor())
                .valido(valido)
                .mensaje(valido
                        ? "Proveedor validado correctamente"
                        : "El proveedor no cumple con la informacion requerida")
                .errores(errores)
                .build();
    }

    @Transactional
    public Proveedor actualizarEstado(Long idProveedor, String nuevoEstado) {

        Proveedor proveedor = proveedorRepository.findById(idProveedor)
                .orElseThrow(() ->
                        new IllegalArgumentException("Proveedor no encontrado"));

        List<String> estadosPermitidos = List.of(
                "Registrado",
                "Activo",
                "Inactivo"
        );

        if (nuevoEstado == null || !estadosPermitidos.contains(nuevoEstado)) {
            throw new IllegalArgumentException(
                    "Estado no válido. Los estados permitidos son: Registrado, Activo e Inactivo"
            );
        }

        proveedor.setEstado(nuevoEstado);

        return proveedorRepository.save(proveedor);
    }

    public List<Proveedor> listarProveedores() {
        return proveedorRepository.findAll();
    }

    public Proveedor obtenerProveedorPorId(Long id) {
        return proveedorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró el proveedor con el ID: " + id));
    }

    public ProveedorDetalleResponse consultarDetalleProveedor(Long id) {
        Proveedor proveedor = proveedorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró el proveedor con ID: " + id));

        List<CatalogoComercial> catalogo = catalogoComercialRepository.findByProveedor_IdProveedor(id);

        List<ProveedorDetalleResponse.ProductoCatalogoDTO> productosDTO = catalogo.stream()
                .map(item -> {
                    var prod = item.getProducto();
                    return ProveedorDetalleResponse.ProductoCatalogoDTO.builder()
                            .idProducto(prod.getIdProducto())
                            .codigoSku(prod.getCodigoSku())
                            .descripcion(prod.getDescripcion())
                            .unidad(prod.getUnidad())
                            .precioReferencial(prod.getPrecioReferencial())
                            .estadoProducto(prod.getEstado())
                            .condiciones(item.getCondiciones())
                            .fechaInicio(item.getFechaInicio())
                            .fechaFin(item.getFechaFin())
                            .build();
                })
                .toList();

        return ProveedorDetalleResponse.builder()
                .idProveedor(proveedor.getIdProveedor())
                .nitRuc(proveedor.getNitRuc())
                .razonSocial(proveedor.getRazonSocial())
                .direccion(proveedor.getDireccion())
                .telefono(proveedor.getTelefono())
                .correo(proveedor.getCorreo())
                .estado(proveedor.getEstado())
                .validado(proveedor.getValidado())
                .fechaValidacion(proveedor.getFechaValidacion())
                .productos(productosDTO)
                .build();
    }

    public BigDecimal consultarPrecioPactado(Long idProveedor, Long idProducto) {

        List<CatalogoComercial> catalogos =
                catalogoComercialRepository
                        .findByProveedor_IdProveedorAndProducto_IdProducto(
                                idProveedor,
                                idProducto
                        );

        LocalDate hoy = LocalDate.now();

        CatalogoComercial catalogoVigente = catalogos.stream()
                .filter(catalogo ->
                        !hoy.isBefore(catalogo.getFechaInicio())
                                && !hoy.isAfter(catalogo.getFechaFin())
                )
                .findFirst()
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "No existe un precio pactado vigente para el proveedor y producto indicados"
                        )
                );

        return catalogoVigente.getProducto().getPrecioReferencial();
    }

    public Integer consultarTiempoEntrega(Long idProveedor, Long idProducto) {

        List<CatalogoComercial> catalogos =
                catalogoComercialRepository
                        .findByProveedor_IdProveedorAndProducto_IdProducto(
                                idProveedor,
                                idProducto
                        );

        if (catalogos.isEmpty()) {
            throw new IllegalArgumentException(
                    "El producto no está asociado al proveedor indicado"
            );
        }

        CondicionComercial condicion =
                condicionComercialRepository
                        .findFirstByProveedor_IdProveedorOrderByFechaRegistroDesc(
                                idProveedor
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "El proveedor no tiene registrado un tiempo de entrega"
                                )
                        );

        return condicion.getPlazoEntregaDias();
    }

    public List<Map<String, Object>> obtenerRankingRetrasos() {

        List<Object[]> resultados =
                incidenciaProveedorRepository.contarRetrasosPorProveedor();

        return resultados.stream()
                .map(resultado -> {
                    Map<String, Object> proveedor = new HashMap<>();

                    proveedor.put("idProveedor", resultado[0]);
                    proveedor.put("razonSocial", resultado[1]);
                    proveedor.put("cantidadRetrasos", resultado[2]);

                    return proveedor;
                })
                .toList();
    }

    public List<Map<String, Object>> obtenerRankingCumplimiento() {

        List<Object[]> resultados =
                incidenciaProveedorRepository.obtenerDatosCumplimiento();

        List<Map<String, Object>> ranking = resultados.stream()
                .map(resultado -> {

                    Long idProveedor = ((Number) resultado[0]).longValue();
                    String razonSocial = (String) resultado[1];
                    long totalIncidencias = ((Number) resultado[2]).longValue();
                    long totalRetrasos = ((Number) resultado[3]).longValue();

                    double porcentajeCumplimiento =
                            totalIncidencias > 0
                                    ? ((double) (totalIncidencias - totalRetrasos)
                                       / totalIncidencias) * 100
                                    : 0.0;

                    Map<String, Object> proveedor = new HashMap<>();

                    proveedor.put("idProveedor", idProveedor);
                    proveedor.put("razonSocial", razonSocial);
                    proveedor.put("totalIncidencias", totalIncidencias);
                    proveedor.put("totalRetrasos", totalRetrasos);
                    proveedor.put("porcentajeCumplimiento", porcentajeCumplimiento);

                    return proveedor;
                })
                .toList();

        ranking.sort((proveedor1, proveedor2) ->
                Double.compare(
                        ((Number) proveedor2.get("porcentajeCumplimiento")).doubleValue(),
                        ((Number) proveedor1.get("porcentajeCumplimiento")).doubleValue()
                )
        );

        return ranking;
    }


}
