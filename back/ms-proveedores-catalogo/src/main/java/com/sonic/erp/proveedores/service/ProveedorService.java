package com.sonic.erp.proveedores.service;

import com.sonic.erp.proveedores.dto.request.ProveedorCreateRequest;
import com.sonic.erp.proveedores.dto.request.ProveedorUpdateRequest;
import com.sonic.erp.proveedores.dto.response.ComparacionPrecioResponse;
import com.sonic.erp.proveedores.dto.response.ProveedorDetalleResponse;
import com.sonic.erp.proveedores.dto.response.CatalogoCategoriaResponse;
import com.sonic.erp.proveedores.dto.response.ComparacionTiempoEntregaResponse;
import com.sonic.erp.proveedores.dto.response.RankingDescuentoResponse;
import com.sonic.erp.proveedores.dto.response.ResumenComparativoProveedorResponse;
import com.sonic.erp.proveedores.dto.response.IndicadoresProveedorResponse;
import com.sonic.erp.proveedores.entity.CatalogoComercial;
import com.sonic.erp.proveedores.entity.Proveedor;
import com.sonic.erp.proveedores.entity.DescuentoCantidad;
import com.sonic.erp.proveedores.entity.InspeccionMercaderia;
import com.sonic.erp.proveedores.repository.InspeccionMercaderiaRepository;
import com.sonic.erp.proveedores.repository.DescuentoCantidadRepository;
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
import com.sonic.erp.proveedores.entity.Producto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import com.sonic.erp.proveedores.repository.DocumentoProveedorRepository;
import com.sonic.erp.proveedores.dto.response.DocumentoAlertaResponse;
import com.sonic.erp.proveedores.entity.DocumentoProveedor;
import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;
import java.math.RoundingMode;
import com.sonic.erp.proveedores.entity.CondicionComercial;
import com.sonic.erp.proveedores.repository.CondicionComercialRepository;
import java.util.stream.Stream;


@Service
@RequiredArgsConstructor

public class ProveedorService {

    private final ProveedorRepository proveedorRepository;
    private final CatalogoComercialRepository catalogoComercialRepository;
    private final CondicionComercialRepository condicionComercialRepository;
    private final IncidenciaProveedorRepository incidenciaProveedorRepository;
    @PersistenceContext
    private EntityManager entityManager;
    private final DescuentoCantidadRepository descuentoCantidadRepository;
    private final InspeccionMercaderiaRepository inspeccionMercaderiaRepository;
    private final DocumentoProveedorRepository documentoProveedorRepository;

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

    @Transactional
    public CatalogoComercial asociarProducto(
            Long idProveedor,
            Long idProducto,
            LocalDate fechaInicio,
            LocalDate fechaFin,
            String condiciones,
            String archivo) {

        // Verificar que el proveedor exista
        Proveedor proveedor = proveedorRepository.findById(idProveedor)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Proveedor no encontrado"
                        )
                );

        // Verificar que el producto exista
        Producto producto = entityManager.find(Producto.class, idProducto);

        if (producto == null) {
            throw new IllegalArgumentException(
                    "Producto no encontrado"
            );
        }

        // Verificar que la asociación no exista
        boolean yaExiste =
                catalogoComercialRepository
                        .existsByProveedor_IdProveedorAndProducto_IdProducto(
                                idProveedor,
                                idProducto
                        );

        if (yaExiste) {
            throw new IllegalArgumentException(
                    "El producto ya está asociado a este proveedor"
            );
        }

        // Crear la asociación
        CatalogoComercial catalogo = CatalogoComercial.builder()
                .proveedor(proveedor)
                .producto(producto)
                .fechaInicio(fechaInicio)
                .fechaFin(fechaFin)
                .condiciones(condiciones)
                .archivo(archivo)
                .build();

        return catalogoComercialRepository.save(catalogo);
    }

    public ComparacionPrecioResponse compararPrecios(Long idProducto) {

        List<CatalogoComercial> catalogos =
                catalogoComercialRepository.findByProducto_IdProducto(idProducto);

        if (catalogos.isEmpty()) {
            throw new IllegalArgumentException(
                    "No existen proveedores asociados al producto indicado"
            );
        }

        LocalDate hoy = LocalDate.now();

        List<CatalogoComercial> catalogosVigentes = catalogos.stream()
                .filter(catalogo ->
                        !hoy.isBefore(catalogo.getFechaInicio())
                                && !hoy.isAfter(catalogo.getFechaFin())
                )
                .toList();

        if (catalogosVigentes.isEmpty()) {
            throw new IllegalArgumentException(
                    "No existen precios vigentes para el producto indicado"
            );
        }

        var producto = catalogosVigentes.get(0).getProducto();

        List<ComparacionPrecioResponse.ProveedorPrecioDTO> proveedores =
                catalogosVigentes.stream()
                        .map(catalogo ->
                                ComparacionPrecioResponse.ProveedorPrecioDTO.builder()
                                        .idProveedor(
                                                catalogo.getProveedor().getIdProveedor()
                                        )
                                        .razonSocial(
                                                catalogo.getProveedor().getRazonSocial()
                                        )
                                        .precio(catalogo.getPrecio())
                                        .build()
                        )
                        .sorted((p1, p2) ->
                                p1.getPrecio().compareTo(p2.getPrecio())
                        )
                        .toList();

        return ComparacionPrecioResponse.builder()
                .idProducto(producto.getIdProducto())
                .codigoSku(producto.getCodigoSku())
                .descripcion(producto.getDescripcion())
                .proveedores(proveedores)
                .build();
    }

    public ComparacionTiempoEntregaResponse compararTiemposEntrega(Long idProducto) {

        List<CatalogoComercial> catalogos =
                catalogoComercialRepository.findByProducto_IdProducto(idProducto);

        if (catalogos.isEmpty()) {
            throw new IllegalArgumentException(
                    "No existen proveedores asociados al producto indicado"
            );
        }

        var producto = catalogos.get(0).getProducto();

        List<ComparacionTiempoEntregaResponse.ProveedorTiempoEntregaDTO> proveedores =
                catalogos.stream()
                        .map(catalogo -> {

                            Long idProveedor =
                                    catalogo.getProveedor().getIdProveedor();

                            CondicionComercial condicion =
                                    condicionComercialRepository
                                            .findFirstByProveedor_IdProveedorOrderByFechaRegistroDesc(
                                                    idProveedor
                                            )
                                            .orElseThrow(() ->
                                                    new IllegalArgumentException(
                                                            "El proveedor "
                                                                    + idProveedor
                                                                    + " no tiene registrado un tiempo de entrega"
                                                    )
                                            );

                            return ComparacionTiempoEntregaResponse
                                    .ProveedorTiempoEntregaDTO.builder()
                                    .idProveedor(idProveedor)
                                    .razonSocial(
                                            catalogo.getProveedor().getRazonSocial()
                                    )
                                    .tiempoEntregaDias(
                                            condicion.getPlazoEntregaDias()
                                    )
                                    .build();
                        })
                        .sorted((p1, p2) ->
                                p1.getTiempoEntregaDias()
                                        .compareTo(p2.getTiempoEntregaDias())
                        )
                        .toList();

        return ComparacionTiempoEntregaResponse.builder()
                .idProducto(producto.getIdProducto())
                .codigoSku(producto.getCodigoSku())
                .descripcion(producto.getDescripcion())
                .proveedores(proveedores)
                .build();
    }

    public List<CatalogoCategoriaResponse> filtrarCatalogoPorCategoria(
            Long idProveedor,
            String categoria) {

        if (!proveedorRepository.existsById(idProveedor)) {
            throw new IllegalArgumentException("Proveedor no encontrado");
        }

        if (categoria == null || categoria.trim().isEmpty()) {
            throw new IllegalArgumentException("La categoría es obligatoria");
        }

        List<CatalogoComercial> catalogos =
                catalogoComercialRepository
                        .findByProveedor_IdProveedorAndProducto_CategoriaIgnoreCase(
                                idProveedor,
                                categoria.trim()
                        );

        return catalogos.stream()
                .map(catalogo -> CatalogoCategoriaResponse.builder()
                        .idCatalogo(catalogo.getIdCatalogo())
                        .idProducto(catalogo.getProducto().getIdProducto())
                        .codigoSku(catalogo.getProducto().getCodigoSku())
                        .descripcion(catalogo.getProducto().getDescripcion())
                        .categoria(catalogo.getProducto().getCategoria())
                        .unidad(catalogo.getProducto().getUnidad())
                        .precio(catalogo.getPrecio())
                        .build())
                .toList();
    }

    public List<CatalogoCategoriaResponse> buscarProductosEnCatalogo(
            Long idProveedor,
            String termino) {

        if (!proveedorRepository.existsById(idProveedor)) {
            throw new IllegalArgumentException("Proveedor no encontrado");
        }

        if (termino == null || termino.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "El término de búsqueda es obligatorio"
            );
        }

        String busqueda = termino.trim();

        List<CatalogoComercial> porDescripcion =
                catalogoComercialRepository
                        .findByProveedor_IdProveedorAndProducto_DescripcionContainingIgnoreCase(
                                idProveedor,
                                busqueda
                        );

        List<CatalogoComercial> porSku =
                catalogoComercialRepository
                        .findByProveedor_IdProveedorAndProducto_CodigoSkuContainingIgnoreCase(
                                idProveedor,
                                busqueda
                        );

        return Stream.concat(
                        porDescripcion.stream(),
                        porSku.stream()
                )
                .distinct()
                .map(catalogo -> CatalogoCategoriaResponse.builder()
                        .idCatalogo(catalogo.getIdCatalogo())
                        .idProducto(catalogo.getProducto().getIdProducto())
                        .codigoSku(catalogo.getProducto().getCodigoSku())
                        .descripcion(catalogo.getProducto().getDescripcion())
                        .categoria(catalogo.getProducto().getCategoria())
                        .unidad(catalogo.getProducto().getUnidad())
                        .precio(catalogo.getPrecio())
                        .build())
                .toList();
    }

    public List<RankingDescuentoResponse> obtenerRankingDescuentos() {

        List<DescuentoCantidad> descuentos =
                descuentoCantidadRepository
                        .findAllByOrderByPorcentajeDescuentoDesc();

        return descuentos.stream()
                .map(descuento -> {

                    CatalogoComercial catalogo =
                            descuento.getCatalogoComercial();

                    return RankingDescuentoResponse.builder()
                            .idProveedor(
                                    catalogo.getProveedor().getIdProveedor()
                            )
                            .razonSocial(
                                    catalogo.getProveedor().getRazonSocial()
                            )
                            .idProducto(
                                    catalogo.getProducto().getIdProducto()
                            )
                            .codigoSku(
                                    catalogo.getProducto().getCodigoSku()
                            )
                            .descripcionProducto(
                                    catalogo.getProducto().getDescripcion()
                            )
                            .cantidadMinima(
                                    descuento.getCantidadMinima()
                            )
                            .cantidadMaxima(
                                    descuento.getCantidadMaxima()
                            )
                            .porcentajeDescuento(
                                    descuento.getPorcentajeDescuento()
                            )
                            .build();
                })
                .toList();
    }

    public List<ResumenComparativoProveedorResponse> obtenerResumenComparativo() {

        List<Proveedor> proveedores = proveedorRepository.findAll();

        return proveedores.stream()
                .map(proveedor -> {

                    Long idProveedor = proveedor.getIdProveedor();

                    // PRECIO PROMEDIO
                    List<CatalogoComercial> catalogos =
                            catalogoComercialRepository
                                    .findByProveedor_IdProveedor(idProveedor);

                    BigDecimal precioPromedio = null;

                    List<BigDecimal> precios = catalogos.stream()
                            .map(CatalogoComercial::getPrecio)
                            .filter(precio -> precio != null)
                            .toList();

                    if (!precios.isEmpty()) {
                        BigDecimal suma = precios.stream()
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                        precioPromedio = suma.divide(
                                BigDecimal.valueOf(precios.size()),
                                2,
                                RoundingMode.HALF_UP
                        );
                    }

                    // DESCUENTO MÁXIMO
                    BigDecimal descuentoMaximo = catalogos.stream()
                            .flatMap(catalogo ->
                                    descuentoCantidadRepository
                                            .findByCatalogoComercial_IdCatalogo(
                                                    catalogo.getIdCatalogo()
                                            )
                                            .stream()
                            )
                            .map(DescuentoCantidad::getPorcentajeDescuento)
                            .filter(descuento -> descuento != null)
                            .max(BigDecimal::compareTo)
                            .orElse(null);

                    // TIEMPO DE ENTREGA
                    Integer tiempoEntregaDias =
                            condicionComercialRepository
                                    .findFirstByProveedor_IdProveedorOrderByFechaRegistroDesc(
                                            idProveedor
                                    )
                                    .map(CondicionComercial::getPlazoEntregaDias)
                                    .orElse(null);

                    // CALIDAD
                    List<InspeccionMercaderia> inspecciones =
                            inspeccionMercaderiaRepository
                                    .findByProveedor_IdProveedor(idProveedor);

                    int totalInspeccionados = inspecciones.stream()
                            .mapToInt(InspeccionMercaderia::getCantidadInspeccionada)
                            .sum();

                    int totalAceptados = inspecciones.stream()
                            .mapToInt(InspeccionMercaderia::getCantidadAceptada)
                            .sum();

                    Double porcentajeCalidad =
                            totalInspeccionados > 0
                                    ? ((double) totalAceptados
                                    / totalInspeccionados) * 100
                                    : null;

                    return ResumenComparativoProveedorResponse.builder()
                            .idProveedor(idProveedor)
                            .razonSocial(proveedor.getRazonSocial())
                            .precioPromedio(precioPromedio)
                            .descuentoMaximo(descuentoMaximo)
                            .tiempoEntregaDias(tiempoEntregaDias)
                            .porcentajeCalidad(porcentajeCalidad)
                            .build();
                })
                .toList();
    }

    public List<IndicadoresProveedorResponse> obtenerIndicadoresProveedores() {

        List<Proveedor> proveedores = proveedorRepository.findAll();

        return proveedores.stream()
                .map(proveedor -> {

                    Long idProveedor = proveedor.getIdProveedor();

                    List<Object[]> datosCumplimiento =
                            incidenciaProveedorRepository.obtenerDatosCumplimiento();

                    Object[] datoProveedor = datosCumplimiento.stream()
                            .filter(dato ->
                                    ((Number) dato[0]).longValue() == idProveedor
                            )
                            .findFirst()
                            .orElse(null);

                    long totalIncidencias = 0;
                    long cantidadRetrasos = 0;
                    double porcentajeCumplimiento = 0.0;

                    if (datoProveedor != null) {
                        totalIncidencias =
                                ((Number) datoProveedor[2]).longValue();

                        cantidadRetrasos =
                                ((Number) datoProveedor[3]).longValue();

                        if (totalIncidencias > 0) {
                            porcentajeCumplimiento =
                                    ((double) (totalIncidencias - cantidadRetrasos)
                                            / totalIncidencias) * 100;
                        }
                    }

                    List<CatalogoComercial> catalogos =
                            catalogoComercialRepository
                                    .findByProveedor_IdProveedor(idProveedor);

                    List<BigDecimal> precios = catalogos.stream()
                            .map(CatalogoComercial::getPrecio)
                            .filter(precio -> precio != null)
                            .toList();

                    BigDecimal precioPromedio = null;

                    if (!precios.isEmpty()) {
                        BigDecimal suma = precios.stream()
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                        precioPromedio = suma.divide(
                                BigDecimal.valueOf(precios.size()),
                                2,
                                RoundingMode.HALF_UP
                        );
                    }

                    BigDecimal descuentoMaximo = catalogos.stream()
                            .flatMap(catalogo ->
                                    descuentoCantidadRepository
                                            .findByCatalogoComercial_IdCatalogo(
                                                    catalogo.getIdCatalogo()
                                            )
                                            .stream()
                            )
                            .map(DescuentoCantidad::getPorcentajeDescuento)
                            .filter(descuento -> descuento != null)
                            .max(BigDecimal::compareTo)
                            .orElse(null);

                    Integer tiempoEntregaDias =
                            condicionComercialRepository
                                    .findFirstByProveedor_IdProveedorOrderByFechaRegistroDesc(
                                            idProveedor
                                    )
                                    .map(CondicionComercial::getPlazoEntregaDias)
                                    .orElse(null);

                    List<InspeccionMercaderia> inspecciones =
                            inspeccionMercaderiaRepository
                                    .findByProveedor_IdProveedor(idProveedor);

                    int totalInspeccionados = inspecciones.stream()
                            .mapToInt(InspeccionMercaderia::getCantidadInspeccionada)
                            .sum();

                    int totalAceptados = inspecciones.stream()
                            .mapToInt(InspeccionMercaderia::getCantidadAceptada)
                            .sum();

                    Double porcentajeCalidad =
                            totalInspeccionados > 0
                                    ? ((double) totalAceptados
                                    / totalInspeccionados) * 100
                                    : null;

                    return IndicadoresProveedorResponse.builder()
                            .idProveedor(idProveedor)
                            .razonSocial(proveedor.getRazonSocial())
                            .porcentajeCumplimiento(porcentajeCumplimiento)
                            .porcentajeCalidad(porcentajeCalidad)
                            .cantidadRetrasos(cantidadRetrasos)
                            .precioPromedio(precioPromedio)
                            .descuentoMaximo(descuentoMaximo)
                            .tiempoEntregaDias(tiempoEntregaDias)
                            .build();
                })
                .toList();
    }

    public List<DocumentoAlertaResponse> obtenerDocumentosProximosAVencer() {

        LocalDate hoy = LocalDate.now();
        LocalDate fechaLimite = hoy.plusDays(30);

        List<DocumentoProveedor> documentos =
                documentoProveedorRepository.findByFechaVencimientoBetween(
                        hoy,
                        fechaLimite
                );

        return documentos.stream()
                .map(documento -> {

                    long diasRestantes =
                            java.time.temporal.ChronoUnit.DAYS.between(
                                    hoy,
                                    documento.getFechaVencimiento()
                            );

                    String mensaje;

                    if (diasRestantes == 0) {
                        mensaje = "El documento vence hoy";
                    } else if (diasRestantes == 1) {
                        mensaje = "El documento vence mañana";
                    } else {
                        mensaje = "El documento vence en "
                                + diasRestantes
                                + " días";
                    }

                    return DocumentoAlertaResponse.builder()
                            .idDocumento(documento.getIdDocumento())
                            .tipoDocumento(documento.getTipoDocumento())
                            .numeroDocumento(documento.getNumeroDocumento())
                            .fechaVencimiento(documento.getFechaVencimiento())
                            .idProveedor(
                                    documento.getProveedor().getIdProveedor()
                            )
                            .razonSocial(
                                    documento.getProveedor().getRazonSocial()
                            )
                            .mensaje(mensaje)
                            .build();
                })
                .toList();
    }
}
