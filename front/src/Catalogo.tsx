import React, { useEffect, useState } from "react";
import CatalogoSidebar from "./CatalogoSidebar";
import ProductoDetalle from "./ProductoDetalle";
import { ComparacionProductos } from "./ComparacionProductos";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Search,
  RefreshCw,
  Power,
  Clock,
  BarChart3,
  TrendingUp,
  Award,
  ShoppingBag,
  ArrowUpRight,
  Package,
  Pencil,
  Truck,
  Tag,
  Filter,
  Building2,
  Plus,
  Upload,
  X,
  Paperclip,
  Timer,
  Zap,
  Sliders,
  Percent,
  CheckSquare,
  Square,
  DollarSign,
} from "lucide-react";
import "./Catalogo.css";
import AsociarCatalogo from "./AsociarCatalogo";
import AlertasDocumentos from "./AlertasDocumentos";

const API_URL = "http://localhost:8080";

export type EstadoProveedor =
  | "Activo"
  | "Inactivo"
  | "Pendiente"
  | "Observado"
  | "Registrado";

export interface Documento {
  idDocumento: number;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaVencimiento: string;
  archivo: string;
  estadoValidacion: "Válido" | "Vencido" | "Pendiente";
}

export interface ProductoCatalogo {
  idProducto: number;
  sku: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  precioPactado: number;
  tiempoEntregaEstimado: string;
  stockDisponible: number;
  unidadMedida: string;
}

export interface DescuentoVolumen {
  cantidadMinima: number;
  descuento: number;
}

type TipoIdentificacion = "NIT" | "RUC";

interface NuevoProveedorForm {
  tipoIdentificacion: TipoIdentificacion;
  nitRuc: string;
  razonSocial: string;
  direccion: string;
  telefono: string;
  correo: string;
}

export interface Proveedor {
  idProveedor: number;
  tipoIdentificacion?: TipoIdentificacion;
  nitRuc: string;
  razonSocial: string;
  direccion: string;
  telefono: string;
  correo: string;
  estado: EstadoProveedor;
  puntajeDesempeno: number;
  ordenesCompra: number;
  montoTotalComprado: number;
  documentos: Documento[];
  catalogoProductos: ProductoCatalogo[];
  descuentoVolumen: DescuentoVolumen[];
  tiempoPromedioDias: number;
}

const proveedoresIniciales: Proveedor[] = [
  {
    idProveedor: 1,
    nitRuc: "20601234567",
    razonSocial: "Pedrauser",
    direccion: "Av. Landaeta, Sepa dios donde vive",
    telefono: "+591 77756186",
    correo: "pedrauser@sonic.com",
    estado: "Activo",
    puntajeDesempeno: 95,
    ordenesCompra: 48,
    montoTotalComprado: 125000,
    descuentoVolumen: [
      { cantidadMinima: 50, descuento: 5 },
      { cantidadMinima: 100, descuento: 8 },
      { cantidadMinima: 500, descuento: 12 },
    ],
    tiempoPromedioDias: 1.5,
    documentos: [
      {
        idDocumento: 101,
        tipoDocumento: "Ficha RUC",
        numeroDocumento: "20601234567",
        fechaVencimiento: "2027-12-31",
        archivo: "ficha_ruc_2026.pdf",
        estadoValidacion: "Válido",
      },
      {
        idDocumento: 102,
        tipoDocumento: "Certificado de Homologación",
        numeroDocumento: "CH-2025-089",
        fechaVencimiento: "2026-11-15",
        archivo: "homologacion_cert.pdf",
        estadoValidacion: "Válido",
      },
    ],
    catalogoProductos: [
      {
        idProducto: 1,
        sku: "PROD-LOG-001",
        nombre: "Caja de Cartón Corrugado Doble Canal (50x40x40)",
        categoria: "Empaque y Embalaje",
        descripcion:
          "Caja de alta resistencia para transporte pesado e importaciones.",
        precioPactado: 4.5,
        tiempoEntregaEstimado: "24 a 48 horas",
        stockDisponible: 5000,
        unidadMedida: "Unidad",
      },
      {
        idProducto: 2,
        sku: "PROD-LOG-002",
        nombre: "Cinta Embalaje Transparente (Pack x 6)",
        categoria: "Empaque y Embalaje",
        descripcion: "Adhesivo de acrílico de alta fijación industrial.",
        precioPactado: 18.2,
        tiempoEntregaEstimado: "24 horas",
        stockDisponible: 1200,
        unidadMedida: "Pack",
      },
      {
        idProducto: 3,
        sku: "PROD-LOG-003",
        nombre: "Film Stretch Strechable Industrial 20 micras",
        categoria: "Paletizado",
        descripcion:
          "Rollo de plástico film transparente para asegurar parihuelas.",
        precioPactado: 32.0,
        tiempoEntregaEstimado: "2 a 3 días hábiles",
        stockDisponible: 850,
        unidadMedida: "Rollo",
      },
    ],
  },
  {
    idProveedor: 2,
    nitRuc: "20109876543",
    razonSocial: "Ya no se qeu poner wazaaa",
    direccion: "Calle Comercio, casco viejo creo",
    telefono: "+591 23462742",
    correo: "cambien@losdatos.com",
    estado: "Observado",
    puntajeDesempeno: 72,
    ordenesCompra: 24,
    montoTotalComprado: 58000,
    descuentoVolumen: [
      { cantidadMinima: 50, descuento: 4 },
      { cantidadMinima: 100, descuento: 7 },
      { cantidadMinima: 500, descuento: 10 },
    ],
    tiempoPromedioDias: 3.2,
    documentos: [
      {
        idDocumento: 103,
        tipoDocumento: "Ficha RUC",
        numeroDocumento: "20109876543",
        fechaVencimiento: "2026-05-10",
        archivo: "ficha_ruc_dist.pdf",
        estadoValidacion: "Vencido",
      },
    ],
    catalogoProductos: [],
  },
  {
    idProveedor: 3,
    nitRuc: "20554433221",
    razonSocial: "Nilmar ponte a trabajar",
    direccion: "Senkata, El alto",
    telefono: "+591 70544491",
    correo: "natesito@waza.com",
    estado: "Inactivo",
    puntajeDesempeno: 45,
    ordenesCompra: 8,
    montoTotalComprado: 14200,
    descuentoVolumen: [
      { cantidadMinima: 50, descuento: 3 },
      { cantidadMinima: 100, descuento: 6 },
      { cantidadMinima: 500, descuento: 9 },
    ],
    tiempoPromedioDias: 5.0,
    documentos: [],
    catalogoProductos: [],
  },
  {
    idProveedor: 4,
    nitRuc: "20448899112",
    razonSocial: "Campielcampi",
    direccion: "nosexdd, la paz",
    telefono: "+591 71994068",
    correo: "samiel@elcmampi.com",
    estado: "Activo",
    puntajeDesempeno: 88,
    ordenesCompra: 36,
    montoTotalComprado: 94000,
    descuentoVolumen: [
      { cantidadMinima: 50, descuento: 5 },
      { cantidadMinima: 100, descuento: 9 },
      { cantidadMinima: 500, descuento: 13 },
    ],
    tiempoPromedioDias: 1.8,
    documentos: [
      {
        idDocumento: 104,
        tipoDocumento: "Ficha RUC",
        numeroDocumento: "20448899112",
        fechaVencimiento: "2027-08-20",
        archivo: "ficha_ruc_tecno.pdf",
        estadoValidacion: "Válido",
      },
    ],
    catalogoProductos: [],
  },
];

const datosFrecuenciaMensualInicial = [
  { mes: "Abr", ordenes: 12, monto: 22000 },
  { mes: "May", ordenes: 18, monto: 34000 },
  { mes: "Jun", ordenes: 15, monto: 28000 },
  { mes: "Jul", ordenes: 22, monto: 45000 },
  { mes: "Ago", ordenes: 28, monto: 56000 },
  { mes: "Sep", ordenes: 21, monto: 41000 },
];

const menuItems = [
  "Gestionar Proveedores",
  "Asociar Catálogo",
  "Comparacion de Productos",
  "Ver Catalogo",
  "Ranking de proveedores",
  "Dashboard de Reportes",
];

const extraerHorasMinimas = (tiempoStr: string): number => {
  if (!tiempoStr) return 999;
  const numMatches = tiempoStr.match(/\d+/g);
  if (!numMatches) return 999;
  const minNum = Math.min(...numMatches.map(Number));
  if (
    tiempoStr.toLowerCase().includes("día") ||
    tiempoStr.toLowerCase().includes("dias")
  ) {
    return minNum * 24;
  }
  return minNum;
};

export const Catalogo = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [proveedores, setProveedores] = useState<Proveedor[]>(proveedoresIniciales);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor>(proveedoresIniciales[0]);

  // Estados de datos sincronizados con Spring Boot
  const [indicadoresBackend, setIndicadoresBackend] = useState<any[]>([]);
  const [rankingDescuentos, setRankingDescuentos] = useState<any[]>([]);
  const [resumenComparativo, setResumenComparativo] = useState<any[]>([]);
  const [entregasCompletas, setEntregasCompletas] = useState<Record<number, number>>({});
  const [desempenoProveedor, setDesempenoProveedor] = useState<any>(null);
  const [idsProductosBusqueda, setIdsProductosBusqueda] = useState<number[] | null>(null);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(false);
  const [datosFrecuenciaMensual, setDatosFrecuenciaMensual] = useState<any[]>(datosFrecuenciaMensualInicial);

  const [metricasBackendRanking, setMetricasBackendRanking] = useState<
    Record<
      number,
      {
        porcentajeAceptados: number;
        porcentajeEntregasCompletas: number;
        porcentajeEntregasATiempo: number;
        cantidadDefectuosos: number;
      }
    >
  >({});

  const [criterioRanking, setCriterioRanking] = useState<"descuento" | "puntuacion" | "tiempo">("descuento");

  const [filtroBusquedaProv, setFiltroBusquedaProv] = useState<string>("");
  const [filtroEstadoProv, setFiltroEstadoProv] = useState<string>("Todos");
  const [sidebarAbierto, setSidebarAbierto] = useState<boolean>(true);
  const [resultadoValidacion, setResultadoValidacion] = useState<{
    ejecutado: boolean;
    esValido: boolean;
    detalles: { campo: string; valido: boolean; mensaje: string }[];
  } | null>(null);

  const [modalDocAbierto, setModalDocAbierto] = useState<boolean>(false);
  const [modalIncidenciaAbierto, setModalIncidenciaAbierto] = useState<boolean>(false);
  const [nuevaIncidencia, setNuevaIncidencia] = useState({ tipo: "", descripcion: "" });
  const [errorIncidencia, setErrorIncidencia] = useState<string>("");
  const [guardandoIncidencia, setGuardandoIncidencia] = useState<boolean>(false);

  const [modalNuevoProveedorAbierto, setModalNuevoProveedorAbierto] = useState<boolean>(false);
  const [proveedorEnEdicionId, setProveedorEnEdicionId] = useState<number | null>(null);
  const [nuevoProveedor, setNuevoProveedor] = useState<NuevoProveedorForm>({
    tipoIdentificacion: "NIT",
    nitRuc: "",
    razonSocial: "",
    direccion: "",
    telefono: "",
    correo: "",
  });

  const [errorFormProveedor, setErrorFormProveedor] = useState<string>("");
  const [mensajeExitoProveedor, setMensajeExitoProveedor] = useState<string>("");

  const [nuevoDoc, setNuevoDoc] = useState({
    tipoDocumento: "Ficha RUC",
    numeroDocumento: "",
    fechaVencimiento: "",
    archivoNombre: "",
  });
  const [errorFormDoc, setErrorFormDoc] = useState<string>("");

  const [busquedaProducto, setBusquedaProducto] = useState<string>("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("Todas");
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoCatalogo | null>(null);

  const [productoCompararSKU, setProductoCompararSKU] = useState<string>("PROD-LOG-001");
  const [cantidadComparacion, setCantidadComparacion] = useState<number>(1);
  const [criterios, setCriterios] = useState({
    precio: true,
    descuento: true,
    entrega: true,
    stock: true,
  });

  const [indicadoresActivos, setIndicadoresActivos] = useState({
    precios: true,
    descuentos: true,
    tiempos: true,
    productosAceptados: true,
    ordenesCumplidas: true,
  });

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  useEffect(() => {
    if (!mensajeExitoProveedor) return;
    const timer = window.setTimeout(() => setMensajeExitoProveedor(""), 4000);
    return () => window.clearTimeout(timer);
  }, [mensajeExitoProveedor]);

  // CARGAR PROVEEDORES Y ADAPTAR CATÁLOGOS COMERCIALES
  const fetchProveedores = async () => {
    try {
      const response = await fetch(`${API_URL}/proveedores`, { headers: getHeaders() });
      if (!response.ok) throw new Error("Error al obtener proveedores");

      const data = await response.json();

      const adaptados: Proveedor[] = await Promise.all(
        data.map(async (p: any) => {
          let catalogoProductos: ProductoCatalogo[] = [];
          let puntajeDesempeno = p.puntajeDesempeno ?? (p.ordenesCompra > 0 ? 70 : 0);

          try {
            const resCat = await fetch(`${API_URL}/proveedores/${p.idProveedor}/catalogo`, { headers: getHeaders() });
            if (resCat.ok) {
              const catData = await resCat.json();
              const prods = catData.productos ?? catData.catalogoProductos ?? [];

              catalogoProductos = await Promise.all(
                prods.map(async (prod: any) => {
                  let precioPactado = Number(prod.precioPactado ?? prod.precioReferencial ?? 0);
                  let tiempoEntregaDias = Number(prod.tiempoEntregaDias ?? 0);

                  try {
                    const [resPrec, resTiemp] = await Promise.all([
                      fetch(`${API_URL}/proveedores/${p.idProveedor}/productos/${prod.idProducto}/precio`, { headers: getHeaders() }),
                      fetch(`${API_URL}/proveedores/${p.idProveedor}/productos/${prod.idProducto}/tiempo-entrega`, { headers: getHeaders() }),
                    ]);
                    if (resPrec.ok) {
                      const precData = await resPrec.json();
                      precioPactado = Number(precData.precioPactado ?? precData.precio ?? precioPactado);
                    }
                    if (resTiemp.ok) {
                      const tiempData = await resTiemp.json();
                      tiempoEntregaDias = Number(tiempData.tiempoEntregaDias ?? tiempoEntregaDias);
                    }
                  } catch (e) {
                    // Mantiene valores por defecto
                  }

                  return {
                    idProducto: prod.idProducto,
                    sku: prod.codigoSku ?? prod.sku ?? "PROD-SKU",
                    nombre: prod.descripcion ?? prod.nombre ?? "Producto",
                    descripcion: prod.descripcion ?? prod.nombre ?? "",
                    categoria: prod.categoria ?? "General",
                    precioPactado,
                    unidadMedida: prod.unidad ?? prod.unidadMedida ?? "Unidad",
                    tiempoEntregaEstimado: tiempoEntregaDias > 0 ? `${tiempoEntregaDias} días` : "24 a 48 horas",
                    stockDisponible: Number(prod.stockDisponible ?? 100),
                  };
                })
              );
            }
          } catch (e) {
            console.warn(`Catálogo del proveedor ${p.idProveedor} sin cargar:`, e);
          }

          return {
            idProveedor: p.idProveedor,
            tipoIdentificacion: p.tipoIdentificacion || "NIT",
            nitRuc: p.nitRuc || "",
            razonSocial: p.razonSocial || "",
            direccion: p.direccion || "",
            telefono: p.telefono || "",
            correo: p.correo || "",
            estado: (p.estado as EstadoProveedor) || "Pendiente",
            puntajeDesempeno,
            ordenesCompra: p.ordenesCompra || 0,
            montoTotalComprado: p.montoTotalComprado || 0,
            tiempoPromedioDias: p.tiempoPromedioDias || 2.0,
            documentos: p.documentos || [],
            catalogoProductos: catalogoProductos.length > 0 ? catalogoProductos : (p.catalogoProductos || []),
            descuentoVolumen: p.descuentoVolumen || [
              { cantidadMinima: 50, descuento: 5 },
              { cantidadMinima: 100, descuento: 10 },
            ],
          };
        })
      );

      setProveedores(adaptados);
      if (adaptados.length > 0) {
        setProveedorSeleccionado((prev) => {
          const match = adaptados.find((pr) => pr.idProveedor === prev.idProveedor);
          return match || adaptados[0];
        });
      }
    } catch (error) {
      console.error("Error al cargar proveedores del backend:", error);
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  // CARGAR INDICADORES, RESUMEN COMPARATIVO Y FRECUENCIA
  useEffect(() => {
    const cargarDatosDashboard = async () => {
      try {
        const [resInd, resRes, resFreq, resDesc] = await Promise.all([
          fetch(`${API_URL}/proveedores/indicadores`, { headers: getHeaders() }).catch(() => null),
          fetch(`${API_URL}/proveedores/resumen-comparativo`, { headers: getHeaders() }).catch(() => null),
          fetch(`${API_URL}/proveedores/ordenes/frecuencia-mensual`, { headers: getHeaders() }).catch(() => null),
          fetch(`${API_URL}/proveedores/ranking-descuentos`, { headers: getHeaders() }).catch(() => null),
        ]);

        if (resInd && resInd.ok) {
          const dataInd = await resInd.json();
          setIndicadoresBackend(dataInd);
        }
        if (resRes && resRes.ok) {
          const dataRes = await resRes.json();
          setResumenComparativo(dataRes);
        }
        if (resFreq && resFreq.ok) {
          const dataFreq = await resFreq.json();
          if (Array.isArray(dataFreq) && dataFreq.length > 0) {
            setDatosFrecuenciaMensual(dataFreq);
          }
        }
        if (resDesc && resDesc.ok) {
          const dataDesc = await resDesc.json();
          setRankingDescuentos(dataDesc);
        }
      } catch (err) {
        console.error("Error en endpoints complementarios del dashboard:", err);
      }
    };

    cargarDatosDashboard();
  }, [activeIndex]);

  // CARGAR RANKING CON ENTREGAS Y CALIDAD DE LA API
  useEffect(() => {
    if (activeIndex === 4 || activeIndex === 5) {
      const cargarRankingAPI = async () => {
        try {
          const [resEnt, resCal] = await Promise.all([
            fetch(`${API_URL}/api/proveedores/ranking?criterio=ENTREGAS&orden=DESC`, { headers: getHeaders() }),
            fetch(`${API_URL}/api/proveedores/ranking?criterio=CALIDAD&orden=ASC`, { headers: getHeaders() }),
          ]);

          if (resEnt.ok && resCal.ok) {
            const dataEnt = await resEnt.json();
            const dataCal = await resCal.json();
            const mapa: Record<number, any> = {};

            dataEnt.forEach((item: any) => {
              const id = item.idProveedor;
              mapa[id] = {
                porcentajeEntregasATiempo: item.porcentajeEntregasATiempo || 0,
                porcentajeEntregasCompletas: item.porcentajeEntregasATiempo || 0,
                cantidadDefectuosos: 0,
                porcentajeAceptados: 100,
              };
            });

            dataCal.forEach((item: any) => {
              const id = item.idProveedor;
              const defectuosos = item.cantidadDefectuosos || 0;
              const aceptados = Math.max(0, 100 - defectuosos);
              if (mapa[id]) {
                mapa[id].cantidadDefectuosos = defectuosos;
                mapa[id].porcentajeAceptados = aceptados;
              } else {
                mapa[id] = {
                  porcentajeEntregasATiempo: 0,
                  porcentajeEntregasCompletas: 0,
                  cantidadDefectuosos: defectuosos,
                  porcentajeAceptados: aceptados,
                };
              }
            });

            setMetricasBackendRanking(mapa);
          }
        } catch (err) {
          console.error("Error cargando ranking de proveedores:", err);
        }
      };

      cargarRankingAPI();
    }
  }, [activeIndex, criterioRanking]);

  // BÚSQUEDA DINÁMICA DE PRODUCTOS VÍA BACKEND
  useEffect(() => {
    const buscarProductosBackend = async () => {
      const termino = busquedaProducto.trim();
      if (!termino || !proveedorSeleccionado?.idProveedor) {
        setIdsProductosBusqueda(null);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/proveedores/${proveedorSeleccionado.idProveedor}/catalogo/buscar?termino=${encodeURIComponent(termino)}`,
          { headers: getHeaders() }
        );
        if (response.ok) {
          const data = await response.json();
          setIdsProductosBusqueda(data.map((prod: any) => prod.idProducto));
        }
      } catch (err) {
        setIdsProductosBusqueda(null);
      }
    };

    const timer = setTimeout(buscarProductosBackend, 300);
    return () => clearTimeout(timer);
  }, [busquedaProducto, proveedorSeleccionado?.idProveedor]);

  // FUNCIONES CALCULADORAS Y EXTRACTORAS
  const obtenerPrecioPromedioProveedor = (p: Proveedor): number => {
    const itemRes = resumenComparativo.find((r) => r.idProveedor === p.idProveedor);
    if (itemRes && itemRes.precioPromedio != null) {
      return Number(itemRes.precioPromedio);
    }
    const ind = indicadoresBackend.find((i) => i.idProveedor === p.idProveedor);
    if (ind && ind.precioPromedio != null) {
      return Number(ind.precioPromedio);
    }
    if (p.catalogoProductos && p.catalogoProductos.length > 0) {
      const suma = p.catalogoProductos.reduce((acc, prod) => acc + (prod.precioPactado || 0), 0);
      return suma / p.catalogoProductos.length;
    }
    return 0;
  };

  const obtenerDescuentoMaximo = (idProveedor: number): number => {
    const itemRes = resumenComparativo.find((r) => r.idProveedor === idProveedor);
    if (itemRes && itemRes.descuentoMaximo != null) {
      return Number(itemRes.descuentoMaximo);
    }
    const deRank = rankingDescuentos
      .filter((r) => r.idProveedor === idProveedor)
      .map((r) => Number(r.porcentajeDescuento ?? 0));
    if (deRank.length > 0) return Math.max(...deRank);

    const prov = proveedores.find((p) => p.idProveedor === idProveedor);
    if (prov && prov.descuentoVolumen && prov.descuentoVolumen.length > 0) {
      return Math.max(...prov.descuentoVolumen.map((d) => d.descuento));
    }
    return 0;
  };

  const obtenerPorcentajeCalidad = (idProveedor: number): number => {
    if (metricasBackendRanking[idProveedor]) {
      return metricasBackendRanking[idProveedor].porcentajeAceptados;
    }
    const itemRes = resumenComparativo.find((r) => r.idProveedor === idProveedor);
    if (itemRes && itemRes.porcentajeCalidad != null) {
      return Number(itemRes.porcentajeCalidad);
    }
    const ind = indicadoresBackend.find((i) => i.idProveedor === idProveedor);
    return ind?.porcentajeCalidad ?? 0;
  };

  const obtenerPorcentajeCumplimiento = (idProveedor: number): number => {
    if (metricasBackendRanking[idProveedor]) {
      return metricasBackendRanking[idProveedor].porcentajeEntregasCompletas;
    }
    const ind = indicadoresBackend.find((i) => i.idProveedor === idProveedor);
    if (ind && ind.porcentajeCumplimiento != null) {
      return Number(ind.porcentajeCumplimiento);
    }
    return entregasCompletas[idProveedor] ?? 0;
  };

  const obtenerTiempoEntregaDias = (idProveedor: number): number => {
    const itemRes = resumenComparativo.find((r) => r.idProveedor === idProveedor);
    if (itemRes && itemRes.tiempoEntregaDias != null) {
      return Number(itemRes.tiempoEntregaDias);
    }
    const ind = indicadoresBackend.find((i) => i.idProveedor === idProveedor);
    if (ind && ind.tiempoEntregaDias != null) {
      return Number(ind.tiempoEntregaDias);
    }
    const prov = proveedores.find((p) => p.idProveedor === idProveedor);
    return prov?.tiempoPromedioDias || 2.0;
  };

  const proveedoresOrdenadosRanking = [...proveedores].sort((a, b) => {
    if (criterioRanking === "descuento") {
      return obtenerDescuentoMaximo(b.idProveedor) - obtenerDescuentoMaximo(a.idProveedor);
    }
    if (criterioRanking === "puntuacion") {
      const scoreB = b.puntajeDesempeno || obtenerPorcentajeCumplimiento(b.idProveedor);
      const scoreA = a.puntajeDesempeno || obtenerPorcentajeCumplimiento(a.idProveedor);
      return scoreB - scoreA;
    }
    return obtenerTiempoEntregaDias(a.idProveedor) - obtenerTiempoEntregaDias(b.idProveedor);
  });

  const top3Proveedores = proveedoresOrdenadosRanking.slice(0, 3);

  const toggleIndicador = (clave: keyof typeof indicadoresActivos) => {
    setIndicadoresActivos((prev) => ({
      ...prev,
      [clave]: !prev[clave],
    }));
  };

  const cambiarCriterio = (criterio: keyof typeof criterios) => {
    setCriterios((actuales) => ({
      ...actuales,
      [criterio]: !actuales[criterio],
    }));
  };

  const cambiarEstadoProveedor = async (nuevoEstado: EstadoProveedor) => {
    try {
      const response = await fetch(
        `${API_URL}/proveedores/${proveedorSeleccionado.idProveedor}/estado?estado=${encodeURIComponent(nuevoEstado)}`,
        { method: "PATCH", headers: getHeaders() }
      );
      if (response.ok) {
        const data = await response.json();
        const estadoFinal = data.estado ?? nuevoEstado;
        setProveedores((prev) =>
          prev.map((p) =>
            p.idProveedor === proveedorSeleccionado.idProveedor ? { ...p, estado: estadoFinal } : p
          )
        );
        setProveedorSeleccionado({ ...proveedorSeleccionado, estado: estadoFinal });
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  const handleRegistrarProveedor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorFormProveedor("");

    if (!nuevoProveedor.tipoIdentificacion) {
      setErrorFormProveedor("Seleccione el tipo de identificación.");
      return;
    }
    if (Object.values(nuevoProveedor).some((valor) => !valor.trim())) {
      setErrorFormProveedor("Complete todos los campos obligatorios.");
      return;
    }

    try {
      if (proveedorEnEdicionId !== null) {
        const res = await fetch(`${API_URL}/proveedores/${proveedorEnEdicionId}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({
            nitRuc: nuevoProveedor.nitRuc.trim(),
            razonSocial: nuevoProveedor.razonSocial.trim(),
            direccion: nuevoProveedor.direccion.trim(),
            telefono: nuevoProveedor.telefono.trim(),
            correo: nuevoProveedor.correo.trim(),
          }),
        });
        if (!res.ok) throw new Error("Error al actualizar el proveedor.");
        await fetchProveedores();
        setModalNuevoProveedorAbierto(false);
        setProveedorEnEdicionId(null);
        setMensajeExitoProveedor("Proveedor actualizado correctamente");
      } else {
        const res = await fetch(`${API_URL}/proveedores`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            nitRuc: nuevoProveedor.nitRuc.trim(),
            razonSocial: nuevoProveedor.razonSocial.trim(),
            direccion: nuevoProveedor.direccion.trim(),
            telefono: nuevoProveedor.telefono.trim(),
            correo: nuevoProveedor.correo.trim(),
          }),
        });
        if (!res.ok) throw new Error("Error al registrar el proveedor.");
        await fetchProveedores();
        setModalNuevoProveedorAbierto(false);
        setMensajeExitoProveedor("Proveedor registrado correctamente");
      }
    } catch (err) {
      setErrorFormProveedor(err instanceof Error ? err.message : "Error al conectar con el servidor.");
    }
  };

  const handleRegistrarIncidencia = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorIncidencia("");
    const tipo = nuevaIncidencia.tipo.trim();
    const descripcion = nuevaIncidencia.descripcion.trim();

    if (!tipo || !descripcion) {
      setErrorIncidencia("Complete todos los campos obligatorios.");
      return;
    }

    setGuardandoIncidencia(true);
    try {
      const response = await fetch(`${API_URL}/incidencias`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          idProveedor: proveedorSeleccionado.idProveedor,
          tipo,
          descripcion,
        }),
      });

      if (!response.ok) throw new Error("No se pudo registrar la incidencia.");
      setNuevaIncidencia({ tipo: "", descripcion: "" });
      setModalIncidenciaAbierto(false);
      setMensajeExitoProveedor("Incidencia registrada correctamente");
    } catch (err) {
      setErrorIncidencia(err instanceof Error ? err.message : "Error de comunicación con el servidor.");
    } finally {
      setGuardandoIncidencia(false);
    }
  };

  const handleRegistrarDocumento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoDoc.numeroDocumento.trim()) {
      setErrorFormDoc("Debe ingresar el número del documento.");
      return;
    }
    if (!nuevoDoc.fechaVencimiento) {
      setErrorFormDoc("Debe seleccionar la fecha de vencimiento.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/proveedores/${proveedorSeleccionado.idProveedor}/documentos`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          tipoDocumento: nuevoDoc.tipoDocumento,
          numeroDocumento: nuevoDoc.numeroDocumento.trim(),
          fechaVencimiento: nuevoDoc.fechaVencimiento,
          archivo:
            nuevoDoc.archivoNombre ||
            `${nuevoDoc.tipoDocumento.toLowerCase().replace(/\s+/g, "_")}_${nuevoDoc.numeroDocumento}.pdf`,
        }),
      });

      const data = response.ok ? await response.json() : null;

      const docObj: Documento = {
        idDocumento: data?.idDocumento ?? Date.now(),
        tipoDocumento: data?.tipoDocumento ?? nuevoDoc.tipoDocumento,
        numeroDocumento: data?.numeroDocumento ?? nuevoDoc.numeroDocumento.trim(),
        fechaVencimiento: data?.fechaVencimiento ?? nuevoDoc.fechaVencimiento,
        archivo:
          data?.archivo ??
          (nuevoDoc.archivoNombre ||
            `${nuevoDoc.tipoDocumento.toLowerCase().replace(/\s+/g, "_")}_${nuevoDoc.numeroDocumento}.pdf`),
        estadoValidacion: data?.estadoValidacion ?? "Pendiente",
      };

      const actualizados = [...proveedorSeleccionado.documentos, docObj];
      setProveedorSeleccionado((prev) => ({ ...prev, documentos: actualizados }));
      setProveedores((prev) =>
        prev.map((p) => (p.idProveedor === proveedorSeleccionado.idProveedor ? { ...p, documentos: actualizados } : p))
      );

      setNuevoDoc({ tipoDocumento: "Ficha RUC", numeroDocumento: "", fechaVencimiento: "", archivoNombre: "" });
      setErrorFormDoc("");
      setModalDocAbierto(false);
      setResultadoValidacion(null);
    } catch (err) {
      setErrorFormDoc("No se pudo registrar el documento.");
    }
  };

  const ejecutarValidacion = async () => {
    try {
      const response = await fetch(`${API_URL}/proveedores/${proveedorSeleccionado.idProveedor}/validar`, {
        method: "POST",
        headers: getHeaders(),
      });
      const data = response.ok ? await response.json() : null;
      console.log("Respuesta validación backend:", data);
    } catch (e) {
      console.error("Error al validar proveedor:", e);
    }

    const p = proveedorSeleccionado;
    const detalles = [
      {
        campo: "RUC / NIT",
        valido: Boolean(p.nitRuc && p.nitRuc.length >= 8),
        mensaje: p.nitRuc && p.nitRuc.length >= 8 ? "Formato y longitud correctos" : "RUC/NIT no válido",
      },
      {
        campo: "Razón Social",
        valido: Boolean(p.razonSocial && p.razonSocial.trim().length > 3),
        mensaje: p.razonSocial ? "Registrado correctamente" : "Razón social incompleta",
      },
      {
        campo: "Dirección Fiscal",
        valido: Boolean(p.direccion && p.direccion.trim().length > 5),
        mensaje: p.direccion ? "Dirección verificada" : "Dirección requerida",
      },
      {
        campo: "Teléfono de Contacto",
        valido: Boolean(p.telefono && p.telefono.trim().length >= 7),
        mensaje: p.telefono ? "Teléfono válido" : "Teléfono no registrado",
      },
      {
        campo: "Correo Electrónico",
        valido: Boolean(p.correo && p.correo.includes("@")),
        mensaje: p.correo && p.correo.includes("@") ? "Correo con formato válido" : "Correo inválido",
      },
      {
        campo: "Documentación Adjunta",
        valido: p.documentos.length > 0 && p.documentos.every((d) => d.estadoValidacion === "Válido"),
        mensaje:
          p.documentos.length === 0
            ? "Sin documentos adjuntos"
            : p.documentos.every((d) => d.estadoValidacion === "Válido")
            ? "Todos los documentos vigentes"
            : "Existen documentos vencidos",
      },
    ];

    const esValido = detalles.every((item) => item.valido);
    setResultadoValidacion({ ejecutado: true, esValido, detalles });
  };

  const asociarProductosAProveedor = (idProveedor: number, productos: ProductoCatalogo[]) => {
    setProveedores((prev) =>
      prev.map((prov) => {
        if (prov.idProveedor !== idProveedor) return prov;
        const ids = new Set(prov.catalogoProductos.map((p) => p.idProducto));
        const nuevos = productos.filter((p) => !ids.has(p.idProducto));
        return nuevos.length > 0 ? { ...prov, catalogoProductos: [...prov.catalogoProductos, ...nuevos] } : prov;
      })
    );
  };

  const proveedoresFiltrados = proveedores.filter((p) => {
    const coincideTexto =
      p.razonSocial.toLowerCase().includes(filtroBusquedaProv.toLowerCase()) ||
      p.nitRuc.includes(filtroBusquedaProv);
    const coincideEstado = filtroEstadoProv === "Todos" || p.estado === filtroEstadoProv;
    return coincideTexto && coincideEstado;
  });

  const productosFiltrados = (proveedorSeleccionado.catalogoProductos || []).filter((prod) => {
    const coincideBusqueda = idsProductosBusqueda === null || idsProductosBusqueda.includes(prod.idProducto);
    const coincideTexto =
      prod.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
      prod.sku.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
      prod.descripcion.toLowerCase().includes(busquedaProducto.toLowerCase());
    const coincideCat = categoriaFiltro === "Todas" || prod.categoria === categoriaFiltro;
    return (idsProductosBusqueda !== null ? coincideBusqueda : coincideTexto) && coincideCat;
  });

  const categoriasDisponibles = [
    "Todas",
    ...Array.from(new Set((proveedorSeleccionado.catalogoProductos || []).map((p) => p.categoria))),
  ];

  const totalOrdenes = proveedores.reduce((sum, p) => sum + p.ordenesCompra, 0);
  const promedioDesempeno =
    proveedores.length > 0
      ? Math.round(
          proveedores.reduce(
            (sum, p) => sum + (p.puntajeDesempeno || obtenerPorcentajeCumplimiento(p.idProveedor)),
            0
          ) / proveedores.length
        )
      : 0;

  const maxOrdenes =
    datosFrecuenciaMensual.length > 0
      ? Math.max(...datosFrecuenciaMensual.map((d: any) => d.ordenes))
      : 1;

  const todosLosProductosComparacion = proveedores.flatMap((p) =>
    p.catalogoProductos.map((prod) => ({ ...prod, proveedor: p }))
  );

  const listaProductosUnicos = Array.from(
    new Map(todosLosProductosComparacion.map((p) => [p.sku, p])).values()
  );

  const proveedoresParaProducto = todosLosProductosComparacion.filter((item) => item.sku === productoCompararSKU);

  const productoActualComparativo =
    listaProductosUnicos.find((p) => p.sku === productoCompararSKU) || listaProductosUnicos[0];

  const precioMinimo =
    proveedoresParaProducto.length > 0 ? Math.min(...proveedoresParaProducto.map((p) => p.precioPactado)) : 0;

  const menorTiempoHoras =
    proveedoresParaProducto.length > 0
      ? Math.min(...proveedoresParaProducto.map((p) => extraerHorasMinimas(p.tiempoEntregaEstimado)))
      : 999;

  const mejorProveedorEntrega = proveedoresParaProducto.find(
    (p) => extraerHorasMinimas(p.tiempoEntregaEstimado) === menorTiempoHoras
  );

  return (
    <div className="catalogo-container">
      <CatalogoSidebar
        items={menuItems}
        activeIndex={activeIndex}
        abierto={sidebarAbierto}
        onToggle={() => setSidebarAbierto((estado) => !estado)}
        onItemClick={(index) => {
          setActiveIndex(index);
          setResultadoValidacion(null);
        }}
      />

      <section className="catalogo-content">
        <header className="catalogo-header">
          <h1 className="catalogo-title">{menuItems[activeIndex]}</h1>
          <p className="catalogo-subtitle">Proveedores y Catalogo</p>
        </header>

        {activeIndex === 0 && (
          <div className="validacion-grid">
            <div className="lista-proveedores-card">
              <button
                type="button"
                className="btn-nuevo-proveedor"
                onClick={() => {
                  setErrorFormProveedor("");
                  setProveedorEnEdicionId(null);
                  setNuevoProveedor({
                    tipoIdentificacion: "NIT",
                    nitRuc: "",
                    razonSocial: "",
                    direccion: "",
                    telefono: "",
                    correo: "",
                  });
                  setModalNuevoProveedorAbierto(true);
                }}
              >
                <Plus size={14} />
                <span>Nuevo proveedor</span>
              </button>

              <div className="busqueda-box">
                <Search size={16} className="busqueda-icon" />
                <input
                  type="text"
                  placeholder="Buscar por RUC o Razón Social..."
                  value={filtroBusquedaProv}
                  onChange={(e) => setFiltroBusquedaProv(e.target.value)}
                  className="busqueda-input"
                />
              </div>

              <div className="filtro-estado-bar">
                {["Todos", "Activo", "Inactivo", "Observado", "Pendiente"].map((est) => (
                  <button
                    key={est}
                    className={`btn-filtro-estado ${filtroEstadoProv === est ? "active" : ""}`}
                    onClick={() => setFiltroEstadoProv(est)}
                  >
                    {est}
                  </button>
                ))}
              </div>

              <div className="proveedores-lista">
                {proveedoresFiltrados.map((p) => (
                  <div
                    key={p.idProveedor}
                    className={`proveedor-item ${proveedorSeleccionado.idProveedor === p.idProveedor ? "active" : ""}`}
                    onClick={() => {
                      setProveedorSeleccionado(p);
                      setResultadoValidacion(null);
                    }}
                  >
                    <div className="item-main">
                      <span className="item-title">{p.razonSocial}</span>
                      <span className="item-sub">RUC: {p.nitRuc}</span>
                    </div>
                    <span className={`badge-estado badge-${p.estado.toLowerCase()}`}>
                      {p.estado}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="detalle-validacion-card">
              {mensajeExitoProveedor && (
                <div className="resultado-panel panel-exito" role="status">
                  <div className="resultado-header">
                    <CheckCircle2 size={18} className="icon-exito" />
                    <span className="resultado-titulo">{mensajeExitoProveedor}</span>
                  </div>
                </div>
              )}

              <div className="detalle-header">
                <div>
                  <h2 className="detalle-title">{proveedorSeleccionado.razonSocial}</h2>
                  <span className="detalle-sub">RUC / NIT: {proveedorSeleccionado.nitRuc}</span>
                </div>
                <div className="acciones-header">
                  <button
                    type="button"
                    className="btn-registrar-doc"
                    onClick={() => {
                      setNuevoProveedor({
                        tipoIdentificacion: proveedorSeleccionado.tipoIdentificacion ?? "NIT",
                        nitRuc: proveedorSeleccionado.nitRuc,
                        razonSocial: proveedorSeleccionado.razonSocial,
                        direccion: proveedorSeleccionado.direccion,
                        telefono: proveedorSeleccionado.telefono,
                        correo: proveedorSeleccionado.correo,
                      });
                      setErrorFormProveedor("");
                      setProveedorEnEdicionId(proveedorSeleccionado.idProveedor);
                      setModalNuevoProveedorAbierto(true);
                    }}
                  >
                    <Pencil size={14} />
                    <span>Editar</span>
                  </button>
                  <button className="btn-validar" onClick={ejecutarValidacion}>
                    <RefreshCw size={14} />
                    <span>Validar Información</span>
                  </button>
                </div>
              </div>

              <div className="seccion-datos">
                <div className="seccion-header-inline">
                  <h3 className="seccion-titulo">Estado del Proveedor</h3>
                  <span className={`badge-estado badge-${proveedorSeleccionado.estado.toLowerCase()}`}>
                    {proveedorSeleccionado.estado}
                  </span>
                </div>

                <div className="control-estado-panel">
                  <span className="control-estado-label">Cambiar Estado Operativo:</span>
                  <div className="botones-estado-group">
                    {(["Activo", "Inactivo", "Observado", "Pendiente"] as EstadoProveedor[]).map((est) => (
                      <button
                        key={est}
                        className={`btn-cambio-estado btn-${est.toLowerCase()} ${
                          proveedorSeleccionado.estado === est ? "selected" : ""
                        }`}
                        onClick={() => cambiarEstadoProveedor(est)}
                      >
                        <Power size={13} />
                        <span>{est}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="seccion-datos">
                <h3 className="seccion-titulo">Información General</h3>
                <div className="datos-grid">
                  <div className="dato-field">
                    <span className="field-label">Dirección Fiscal</span>
                    <span className="field-value">{proveedorSeleccionado.direccion}</span>
                  </div>
                  <div className="dato-field">
                    <span className="field-label">Teléfono</span>
                    <span className="field-value">{proveedorSeleccionado.telefono}</span>
                  </div>
                  <div className="dato-field">
                    <span className="field-label">Correo Electrónico</span>
                    <span className="field-value">{proveedorSeleccionado.correo}</span>
                  </div>
                  <div className="dato-field desempeno-field">
                    <div className="desempeno-header">
                      <span className="field-label">Desempeño del proveedor</span>
                      <span className="desempeno-porcentaje">
                        {proveedorSeleccionado.puntajeDesempeno || obtenerPorcentajeCumplimiento(proveedorSeleccionado.idProveedor)}%
                      </span>
                    </div>
                    <div className="desempeno-barra">
                      <div
                        className="desempeno-progreso"
                        style={{
                          width: `${proveedorSeleccionado.puntajeDesempeno || obtenerPorcentajeCumplimiento(proveedorSeleccionado.idProveedor)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="dato-field">
                    <span className="field-label">Productos Aceptados</span>
                    <span className="field-value">
                      {obtenerPorcentajeCalidad(proveedorSeleccionado.idProveedor)}%
                    </span>
                  </div>
                  <div className="dato-field">
                    <span className="field-label">Entregas Completas</span>
                    <span className="field-value">
                      {obtenerPorcentajeCumplimiento(proveedorSeleccionado.idProveedor)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="seccion-datos">
                <div className="seccion-header-flex">
                  <h3 className="seccion-titulo">Documentos del Proveedor</h3>
                  <button className="btn-registrar-doc" onClick={() => setModalDocAbierto(true)}>
                    <Plus size={14} />
                    <span>Registrar Documento</span>
                  </button>
                </div>
                <div className="documentos-tabla-wrapper">
                  <table className="documentos-tabla">
                    <thead>
                      <tr>
                        <th>Tipo Documento</th>
                        <th>Numero</th>
                        <th>Vencimiento</th>
                        <th>Archivo Adjunto</th>
                        <th>Estado Documento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proveedorSeleccionado.documentos && proveedorSeleccionado.documentos.length > 0 ? (
                        proveedorSeleccionado.documentos.map((doc) => (
                          <tr key={doc.idDocumento}>
                            <td>
                              <div className="doc-type-cell">
                                <FileText size={14} />
                                <span>{doc.tipoDocumento}</span>
                              </div>
                            </td>
                            <td>{doc.numeroDocumento}</td>
                            <td>{doc.fechaVencimiento}</td>
                            <td>
                              <div className="doc-file-cell">
                                <Paperclip size={12} />
                                <span>{doc.archivo}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`doc-status status-${doc.estadoValidacion.toLowerCase()}`}>
                                {doc.estadoValidacion}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="tabla-vacia">
                            No hay documentos registrados para este proveedor.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="seccion-datos">
                <div className="seccion-header-flex">
                  <h3 className="seccion-titulo">Incidencias del Proveedor</h3>
                  <button className="btn-registrar-doc" onClick={() => setModalIncidenciaAbierto(true)}>
                    <Plus size={14} />
                    <span>Registrar incidencia</span>
                  </button>
                </div>
              </div>

              {resultadoValidacion && (
                <div className={`resultado-panel ${resultadoValidacion.esValido ? "panel-exito" : "panel-alerta"}`}>
                  <div className="resultado-header">
                    {resultadoValidacion.esValido ? (
                      <CheckCircle2 size={18} className="icon-exito" />
                    ) : (
                      <AlertCircle size={18} className="icon-alerta" />
                    )}
                    <span className="resultado-titulo">
                      {resultadoValidacion.esValido
                        ? "Validación Exitosa: La información cumple los requisitos obligatorios"
                        : "Validación Incompleta: Se detectaron inconsistencias u omisiones"}
                    </span>
                  </div>
                  <div className="checklist-grid">
                    {resultadoValidacion.detalles.map((det, index) => (
                      <div key={index} className="check-item">
                        {det.valido ? <ShieldCheck size={14} className="check-valid" /> : <XCircle size={14} className="check-invalid" />}
                        <span className="check-label">{det.campo}:</span>
                        <span className="check-msg">{det.mensaje}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeIndex === 1 && (
          <AsociarCatalogo proveedores={proveedores} onAsociarProductos={asociarProductosAProveedor} />
        )}

        {activeIndex === 2 && <ComparacionProductos proveedores={proveedores} />}

        {activeIndex === 3 && (
          <div className="catalogo-productos-layout">
            <div className="selector-proveedor-card">
              <div className="selector-header">
                <div className="selector-info">
                  <span className="selector-label">Seleccionar Proveedor:</span>
                  <div className="select-wrapper">
                    <Building2 size={16} className="select-icon" />
                    <select
                      className="proveedor-dropdown"
                      value={proveedorSeleccionado.idProveedor}
                      onChange={(e) => {
                        const prov = proveedores.find((p) => p.idProveedor === Number(e.target.value));
                        if (prov) {
                          setProveedorSeleccionado(prov);
                          setBusquedaProducto("");
                          setCategoriaFiltro("Todas");
                          setProductoSeleccionado(null);
                        }
                      }}
                    >
                      {proveedores.map((p) => (
                        <option key={p.idProveedor} value={p.idProveedor}>
                          {p.razonSocial} ({p.nitRuc})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="proveedor-meta-pills">
                  <span className={`badge-estado badge-${proveedorSeleccionado.estado.toLowerCase()}`}>
                    Estado: {proveedorSeleccionado.estado}
                  </span>
                  <span className="pill-metric">
                    Puntaje: <strong>{proveedorSeleccionado.puntajeDesempeno}%</strong>
                  </span>
                  <span className="pill-metric">
                    Productos: <strong>{(proveedorSeleccionado.catalogoProductos || []).length}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="filtros-catalogo-bar">
              <div className="busqueda-box-amplia">
                <Search size={16} className="busqueda-icon" />
                <input
                  type="text"
                  placeholder="Buscar por SKU, Nombre o Descripción del producto..."
                  value={busquedaProducto}
                  onChange={(e) => setBusquedaProducto(e.target.value)}
                  className="busqueda-input"
                />
              </div>

              <div className="filtro-categoria-box">
                <Filter size={15} className="filtro-icon" />
                <select
                  className="categoria-dropdown"
                  value={categoriaFiltro}
                  onChange={(e) => setCategoriaFiltro(e.target.value)}
                >
                  {categoriasDisponibles.map((cat) => (
                    <option key={cat} value={cat}>
                      Categoría: {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="tabla-catalogo-card">
              <div className="tabla-header-info">
                <Package size={18} className="icono-seccion" />
                <h3 className="titulo-tabla">Catalogo de productos</h3>
              </div>
              <span className="conteo-resultados">
                Mostrando {productosFiltrados.length} de {(proveedorSeleccionado.catalogoProductos || []).length} productos
              </span>
            </div>

            <div className="documentos-tabla-wrapper">
              <table className="documentos-tabla">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Producto / Descripción</th>
                    <th>Categoría</th>
                    <th>Precio Pactado</th>
                    <th>Tiempo Estimado Entrega</th>
                    <th>Stock Dispon.</th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.length > 0 ? (
                    productosFiltrados.map((prod) => (
                      <tr key={prod.idProducto} onClick={() => setProductoSeleccionado(prod)} className="producto-fila">
                        <td>
                          <span className="sku-badge">
                            <Tag size={12} />
                            {prod.sku}
                          </span>
                        </td>
                        <td>
                          <div className="producto-info-cell">
                            <span className="producto-nombre">{prod.nombre}</span>
                            <span className="producto-desc">{prod.descripcion}</span>
                          </div>
                        </td>
                        <td>
                          <span className="categoria-tag">{prod.categoria}</span>
                        </td>
                        <td>
                          <span className="precio-pactado-tag">{prod.precioPactado.toFixed(2)} Bs.</span>
                          <span className="unidad-sub"> / {prod.unidadMedida}</span>
                        </td>
                        <td>
                          <div className="entrega-cell">
                            <Truck size={14} className="icon-truck" />
                            <span>{prod.tiempoEntregaEstimado}</span>
                          </div>
                        </td>
                        <td>
                          <span className="stock-val">
                            {prod.stockDisponible} {prod.unidadMedida}s
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="tabla-vacia">
                        {(proveedorSeleccionado.catalogoProductos || []).length === 0
                          ? "Este proveedor no cuenta con productos asociados en su catálogo."
                          : "No se encontraron productos que coincidan con la búsqueda."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {productoSeleccionado && (
              <ProductoDetalle
                producto={productoSeleccionado}
                productos={proveedorSeleccionado.catalogoProductos}
                onCerrar={() => setProductoSeleccionado(null)}
                onCambiarProducto={setProductoSeleccionado}
              />
            )}
          </div>
        )}

        {/* 4. RANKING DE PROVEEDORES */}
        {activeIndex === 4 && (
          <div className="dashboard-container">
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon-wrapper kpi-blue">
                  <TrendingUp size={20} />
                </div>
                <div className="kpi-content">
                  <span className="kpi-title">Promedio Desempeño</span>
                  <span className="kpi-value">{promedioDesempeno}%</span>
                  <span className="kpi-sub positive">
                    <ArrowUpRight size={12} /> +4.2% este mes
                  </span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-wrapper kpi-purple">
                  <ShoppingBag size={20} />
                </div>
                <div className="kpi-content">
                  <span className="kpi-title">Órdenes Totales</span>
                  <span className="kpi-value">{totalOrdenes}</span>
                  <span className="kpi-sub">Frecuencia de compra activa</span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-wrapper kpi-green">
                  <Award size={20} />
                </div>
                <div className="kpi-content">
                  <span className="kpi-title">Proveedor Líder</span>
                  <span className="kpi-value">{top3Proveedores[0]?.razonSocial || "N/A"}</span>
                  <span className="kpi-sub">
                    {top3Proveedores[0]?.puntajeDesempeno || 0}% puntualidad
                  </span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-wrapper kpi-amber">
                  <BarChart3 size={20} />
                </div>
                <div className="kpi-content">
                  <span className="kpi-title">Proveedores Activos</span>
                  <span className="kpi-value">
                    {proveedores.filter((p) => p.estado === "Activo").length} / {proveedores.length}
                  </span>
                  <span className="kpi-sub">Condición operativa</span>
                </div>
              </div>
            </div>

            <div className="ranking-header-control">
              <div>
                <h3 className="chart-title">Ranking de Proveedores por Descuentos y Desempeño</h3>
                <p className="chart-subtitle">Selecciona el criterio para actualizar la gráfica dinámicamente</p>
              </div>

              <div className="ranking-select-container">
                <span className="ranking-select-label">Ordenar por:</span>
                <select
                  className="ranking-combobox"
                  value={criterioRanking}
                  onChange={(e) => setCriterioRanking(e.target.value as "descuento" | "puntuacion" | "tiempo")}
                >
                  <option value="descuento">Los que más descuentos ofrecen</option>
                  <option value="puntuacion">Los que más puntuación tienen</option>
                  <option value="tiempo">Los que menos tardan en entregar</option>
                </select>
              </div>
            </div>

            <div className="ranking-top3-grid">
              {top3Proveedores.map((p, idx) => (
                <div key={p.idProveedor} className={`ranking-top-card pos-${idx + 1}`}>
                  <span className="top-badge-pos">{idx + 1}er Lugar</span>
                  <h4 className="top-card-nombre">{p.razonSocial}</h4>
                  <span className="top-card-sub">RUC: {p.nitRuc}</span>

                  <div className="top-card-metric">
                    <span className="metric-valor-destacado">
                      {criterioRanking === "descuento" && `${obtenerDescuentoMaximo(p.idProveedor)}%`}
                      {criterioRanking === "puntuacion" && `${p.puntajeDesempeno || obtenerPorcentajeCumplimiento(p.idProveedor)}%`}
                      {criterioRanking === "tiempo" && `${obtenerTiempoEntregaDias(p.idProveedor)} días`}
                    </span>
                    <span className="metric-etiqueta">
                      {criterioRanking === "descuento" && "Descuento por Cantidad"}
                      {criterioRanking === "puntuacion" && "Puntaje de Desempeño"}
                      {criterioRanking === "tiempo" && "Tiempo Promedio de Entrega"}
                    </span>
                  </div>

                  <div>
                    <span className={`badge-estado badge-${p.estado.toLowerCase()}`}>
                      {p.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <div className="chart-header">
                  <div>
                    <h3 className="chart-title">Gráfica Comparativa de Ranking</h3>
                    <p className="chart-subtitle">
                      {criterioRanking === "descuento" && "Porcentaje de descuento ofrecido para compras por volumen"}
                      {criterioRanking === "puntuacion" && "Evaluación global de desempeño y cumplimiento"}
                      {criterioRanking === "tiempo" && "Días promedios de tiempo de respuesta y abastecimiento"}
                    </p>
                  </div>
                  <BarChart3 size={18} className="chart-header-icon" />
                </div>

                <div className="ranking-bars-list">
                  {proveedoresOrdenadosRanking.map((p) => {
                    let textoValor: string;
                    let porcentajeAncho: number;

                    if (criterioRanking === "descuento") {
                      const desc = obtenerDescuentoMaximo(p.idProveedor);
                      textoValor = `${desc}%`;
                      porcentajeAncho = Math.round((desc / 20) * 100);
                    } else if (criterioRanking === "puntuacion") {
                      const score = p.puntajeDesempeno || obtenerPorcentajeCumplimiento(p.idProveedor);
                      textoValor = `${score}%`;
                      porcentajeAncho = score;
                    } else {
                      const dias = obtenerTiempoEntregaDias(p.idProveedor);
                      textoValor = `${dias} días`;
                      porcentajeAncho = Math.round(((6 - dias) / 5) * 100);
                    }

                    return (
                      <div key={p.idProveedor} className="ranking-item">
                        <div className="ranking-item-info">
                          <span className="ranking-name">{p.razonSocial}</span>
                          <span className="ranking-score">{textoValor}</span>
                        </div>
                        <div className="ranking-bar-track">
                          <div
                            className={`ranking-bar-fill ${
                              porcentajeAncho >= 75 ? "fill-high" : porcentajeAncho >= 45 ? "fill-mid" : "fill-low"
                            }`}
                            style={{ width: `${Math.min(100, Math.max(5, porcentajeAncho))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <div>
                    <h3 className="chart-title">Frecuencia Mensual de Órdenes</h3>
                    <p className="chart-subtitle">Volumen de solicitudes procesadas en los últimos meses</p>
                  </div>
                  <ShoppingBag size={18} className="chart-header-icon" />
                </div>

                <div className="freq-bar-chart">
                  {datosFrecuenciaMensual.map((item: any) => {
                    const alturaPct = Math.round((item.ordenes / maxOrdenes) * 100);
                    return (
                      <div key={item.mes} className="freq-bar-col">
                        <span className="freq-bar-val">{item.ordenes}</span>
                        <div className="freq-bar-container">
                          <div className="freq-bar" style={{ height: `${alturaPct}%` }} />
                        </div>
                        <span className="freq-bar-label">{item.mes}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. DASHBOARD KPIS */}
        {activeIndex === 5 && (
          <div className="dashboard-container">
            <AlertasDocumentos proveedores={proveedores} />

            <div className="dashboard-filtros-bar">
              <span className="filtros-bar-label">
                <Sliders size={15} />
                Personalizar Indicadores del Dashboard:
              </span>
              <div className="filtros-checkboxes-group">
                <button
                  className={`checkbox-indicador-btn ${indicadoresActivos.precios ? "active" : ""}`}
                  onClick={() => toggleIndicador("precios")}
                >
                  {indicadoresActivos.precios ? <CheckSquare size={14} /> : <Square size={14} />}
                  <span>Precios Promedio</span>
                </button>

                <button
                  className={`checkbox-indicador-btn ${indicadoresActivos.descuentos ? "active" : ""}`}
                  onClick={() => toggleIndicador("descuentos")}
                >
                  {indicadoresActivos.descuentos ? <CheckSquare size={14} /> : <Square size={14} />}
                  <span>Descuentos por Cantidad</span>
                </button>

                <button
                  className={`checkbox-indicador-btn ${indicadoresActivos.tiempos ? "active" : ""}`}
                  onClick={() => toggleIndicador("tiempos")}
                >
                  {indicadoresActivos.tiempos ? <CheckSquare size={14} /> : <Square size={14} />}
                  <span>Tiempos de Entrega</span>
                </button>

                <button
                  className={`checkbox-indicador-btn ${indicadoresActivos.productosAceptados ? "active" : ""}`}
                  onClick={() => toggleIndicador("productosAceptados")}
                >
                  {indicadoresActivos.productosAceptados ? <CheckSquare size={14} /> : <Square size={14} />}
                  <span>Porcentaje de Productos Aceptados</span>
                </button>

                <button
                  className={`checkbox-indicador-btn ${indicadoresActivos.ordenesCumplidas ? "active" : ""}`}
                  onClick={() => toggleIndicador("ordenesCumplidas")}
                >
                  {indicadoresActivos.ordenesCumplidas ? <CheckSquare size={14} /> : <Square size={14} />}
                  <span>Porcentaje de Órdenes Cumplidas</span>
                </button>
              </div>
            </div>

            <div className="dashboard-grid-personalizado">
              {indicadoresActivos.precios && (
                <div className="chart-card">
                  <div className="chart-header">
                    <div>
                      <h3 className="chart-title">Comparativo de Precios Promedio</h3>
                      <p className="chart-subtitle">Promedio de precios pactados en catálogo por proveedor</p>
                    </div>
                    <DollarSign size={18} className="chart-header-icon" />
                  </div>

                  <div className="ranking-bars-list">
                    {proveedores.map((p) => {
                      const precioProm = obtenerPrecioPromedioProveedor(p);
                      const pct = Math.min(100, Math.round((precioProm / 3.0) * 100));
                      return (
                        <div key={p.idProveedor} className="ranking-item">
                          <div className="ranking-item-info">
                            <span className="ranking-name">{p.razonSocial}</span>
                            <span className="ranking-score">
                              {precioProm > 0 ? `${precioProm.toFixed(2)} Bs.` : "0.00 Bs."}
                            </span>
                          </div>
                          <div className="ranking-bar-track">
                            <div
                              className="ranking-bar-fill fill-mid"
                              style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {indicadoresActivos.descuentos && (
                <div className="chart-card">
                  <div className="chart-header">
                    <div>
                      <h3 className="chart-title">Descuentos por Cantidad</h3>
                      <p className="chart-subtitle">Porcentaje máximo de descuento por volumen ofertado</p>
                    </div>
                    <Percent size={18} className="chart-header-icon" />
                  </div>

                  <div className="ranking-bars-list">
                    {proveedores.map((p) => {
                      const desc = obtenerDescuentoMaximo(p.idProveedor);
                      const pct = Math.round((desc / 20) * 100);
                      return (
                        <div key={p.idProveedor} className="ranking-item">
                          <div className="ranking-item-info">
                            <span className="ranking-name">{p.razonSocial}</span>
                            <span className="ranking-score">{desc}%</span>
                          </div>
                          <div className="ranking-bar-track">
                            <div
                              className="ranking-bar-fill fill-high"
                              style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {indicadoresActivos.tiempos && (
                <div className="chart-card">
                  <div className="chart-header">
                    <div>
                      <h3 className="chart-title">Tiempos Promedio de Entrega</h3>
                      <p className="chart-subtitle">Días estimados para la recepción de pedidos</p>
                    </div>
                    <Clock size={18} className="chart-header-icon" />
                  </div>

                  <div className="ranking-bars-list">
                    {proveedores.map((p) => {
                      const dias = obtenerTiempoEntregaDias(p.idProveedor);
                      const pct = Math.round(((6 - dias) / 5) * 100);
                      return (
                        <div key={p.idProveedor} className="ranking-item">
                          <div className="ranking-item-info">
                            <span className="ranking-name">{p.razonSocial}</span>
                            <span className="ranking-score">{dias} días</span>
                          </div>
                          <div className="ranking-bar-track">
                            <div
                              className="ranking-bar-fill fill-mid"
                              style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {indicadoresActivos.productosAceptados && (
                <div className="chart-card">
                  <div className="chart-header">
                    <div>
                      <h3 className="chart-title">Porcentaje de Productos Aceptados</h3>
                      <p className="chart-subtitle">Índice de productos aceptados sin observaciones</p>
                    </div>
                    <Award size={18} className="chart-header-icon" />
                  </div>

                  <div className="ranking-bars-list">
                    {proveedores.map((p) => {
                      const cal = obtenerPorcentajeCalidad(p.idProveedor);
                      return (
                        <div key={p.idProveedor} className="ranking-item">
                          <div className="ranking-item-info">
                            <span className="ranking-name">{p.razonSocial}</span>
                            <span className="ranking-score">{cal}%</span>
                          </div>
                          <div className="ranking-bar-track">
                            <div
                              className="ranking-bar-fill fill-high"
                              style={{ width: `${Math.min(100, Math.max(5, cal))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {indicadoresActivos.ordenesCumplidas && (
                <div className="chart-card">
                  <div className="chart-header">
                    <div>
                      <h3 className="chart-title">Porcentaje de Órdenes Cumplidas</h3>
                      <p className="chart-subtitle">Índice de órdenes de compra entregadas a tiempo y completas</p>
                    </div>
                    <CheckCircle2 size={18} className="chart-header-icon" />
                  </div>

                  <div className="ranking-bars-list">
                    {proveedores.map((p) => {
                      const cpl = obtenerPorcentajeCumplimiento(p.idProveedor);
                      return (
                        <div key={p.idProveedor} className="ranking-item">
                          <div className="ranking-item-info">
                            <span className="ranking-name">{p.razonSocial}</span>
                            <span className="ranking-score">{cpl}%</span>
                          </div>
                          <div className="ranking-bar-track">
                            <div
                              className="ranking-bar-fill fill-high"
                              style={{ width: `${Math.min(100, Math.max(5, cpl))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="tabla-catalogo-card">
              <div className="tabla-header-info">
                <div className="titulo-tabla-group">
                  <BarChart3 size={18} className="icono-seccion" />
                  <h3 className="titulo-tabla">Resumen Comparativo de Desempeño</h3>
                </div>
                <span className="conteo-resultados">
                  Análisis conjunto de precios, descuentos, tiempos y calidad
                </span>
              </div>

              <div className="documentos-tabla-wrapper">
                <table className="documentos-tabla">
                  <thead>
                    <tr>
                      <th>Proveedor</th>
                      <th>Precio Promedio</th>
                      <th>Descuento por Volumen</th>
                      <th>Tiempo Entrega</th>
                      <th>Aceptación Calidad</th>
                      <th>Puntaje Desempeño</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumenComparativo && resumenComparativo.length > 0
                      ? resumenComparativo.map((r: any) => {
                          const prov = proveedores.find((p) => p.idProveedor === r.idProveedor);
                          return (
                            <tr key={r.idProveedor}>
                              <td>
                                <div className="producto-info-cell">
                                  <span className="producto-nombre">{r.razonSocial}</span>
                                  <span className="producto-desc">RUC: {prov?.nitRuc ?? "N/A"}</span>
                                </div>
                              </td>
                              <td>
                                <span className="precio-pactado-tag">
                                  {r.precioPromedio != null ? `${Number(r.precioPromedio).toFixed(2)} Bs.` : "N/A"}
                                </span>
                              </td>
                              <td>
                                <span className="font-semibold">
                                  {r.descuentoMaximo != null ? `${r.descuentoMaximo}%` : "N/A"}
                                </span>
                              </td>
                              <td>
                                <div className="entrega-cell">
                                  <Truck size={14} className="icon-truck" />
                                  <span>{r.tiempoEntregaDias != null ? `${r.tiempoEntregaDias} días` : "N/A"}</span>
                                </div>
                              </td>
                              <td>
                                <span className="score-calidad">
                                  {r.porcentajeCalidad != null ? `${r.porcentajeCalidad}%` : "N/A"}
                                </span>
                              </td>
                              <td>
                                <span className="font-semibold">{prov?.puntajeDesempeno ?? 0}%</span>
                              </td>
                              <td>
                                {prov && (
                                  <span className={`badge-estado badge-${prov.estado.toLowerCase()}`}>
                                    {prov.estado}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      : proveedores.map((p) => {
                          const precioProm = obtenerPrecioPromedioProveedor(p);
                          const cal = obtenerPorcentajeCalidad(p.idProveedor);
                          return (
                            <tr key={p.idProveedor}>
                              <td>
                                <div className="producto-info-cell">
                                  <span className="producto-nombre">{p.razonSocial}</span>
                                  <span className="producto-desc">RUC: {p.nitRuc}</span>
                                </div>
                              </td>
                              <td>
                                <span className="precio-pactado-tag">
                                  {precioProm > 0 ? `${precioProm.toFixed(2)} Bs.` : "N/A"}
                                </span>
                              </td>
                              <td>
                                <span className="font-semibold">{obtenerDescuentoMaximo(p.idProveedor)}%</span>
                              </td>
                              <td>
                                <div className="entrega-cell">
                                  <Truck size={14} className="icon-truck" />
                                  <span>{obtenerTiempoEntregaDias(p.idProveedor)} días</span>
                                </div>
                              </td>
                              <td>
                                <span className="score-calidad">{cal}%</span>
                              </td>
                              <td>
                                <span className="font-semibold">{p.puntajeDesempeno}%</span>
                              </td>
                              <td>
                                <span className={`badge-estado badge-${p.estado.toLowerCase()}`}>
                                  {p.estado}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODAL NUEVO / EDITAR PROVEEDOR */}
        {modalNuevoProveedorAbierto && (
          <div className="modal-overlay">
            <div className="modal-card modal-card-proveedor" role="dialog" aria-modal="true">
              <div className="modal-header">
                <div>
                  <h3 className="modal-title">
                    {proveedorEnEdicionId === null ? "Nuevo proveedor" : "Editar proveedor"}
                  </h3>
                  <p className="modal-subtitle">
                    {proveedorEnEdicionId === null
                      ? "Ingresa los datos de identificación y contacto"
                      : "Actualiza los datos de identificación y contacto"}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-close-modal"
                  aria-label="Cerrar formulario"
                  onClick={() => setModalNuevoProveedorAbierto(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleRegistrarProveedor} className="modal-form">
                {errorFormProveedor && (
                  <div className="form-error-msg">
                    <AlertCircle size={14} />
                    <span>{errorFormProveedor}</span>
                  </div>
                )}

                <div className="form-grid-proveedor">
                  <div className="form-group">
                    <label className="form-label">Tipo de identificación</label>
                    <select
                      className="form-input"
                      value={nuevoProveedor.tipoIdentificacion}
                      required
                      onChange={(e) =>
                        setNuevoProveedor((actual) => ({
                          ...actual,
                          tipoIdentificacion: e.target.value as TipoIdentificacion,
                        }))
                      }
                    >
                      <option value="NIT">NIT</option>
                      <option value="RUC">RUC</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Número de identificación</label>
                    <input
                      type="text"
                      className="form-input"
                      value={nuevoProveedor.nitRuc}
                      onChange={(e) =>
                        setNuevoProveedor((actual) => ({ ...actual, nitRuc: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div className="form-group form-group-full">
                    <label className="form-label">Razón social</label>
                    <input
                      type="text"
                      className="form-input"
                      value={nuevoProveedor.razonSocial}
                      onChange={(e) =>
                        setNuevoProveedor((actual) => ({ ...actual, razonSocial: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div className="form-group form-group-full">
                    <label className="form-label">Dirección fiscal</label>
                    <input
                      type="text"
                      className="form-input"
                      value={nuevoProveedor.direccion}
                      onChange={(e) =>
                        setNuevoProveedor((actual) => ({ ...actual, direccion: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div className="form-group form-group-contacto">
                    <label className="form-label">Teléfono</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={nuevoProveedor.telefono}
                      onChange={(e) =>
                        setNuevoProveedor((actual) => ({ ...actual, telefono: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div className="form-group form-group-contacto">
                    <label className="form-label">Correo electrónico</label>
                    <input
                      type="email"
                      className="form-input"
                      value={nuevoProveedor.correo}
                      onChange={(e) =>
                        setNuevoProveedor((actual) => ({ ...actual, correo: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-cancelar"
                    onClick={() => setModalNuevoProveedorAbierto(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-guardar">
                    {proveedorEnEdicionId === null ? "Guardar proveedor" : "Guardar cambios"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL INCIDENCIA */}
        {modalIncidenciaAbierto && (
          <div className="modal-overlay">
            <div className="modal-card" role="dialog" aria-modal="true">
              <div className="modal-header">
                <div>
                  <h3 className="modal-title">Registrar incidencia</h3>
                  <p className="modal-subtitle">Proveedor: {proveedorSeleccionado.razonSocial}</p>
                </div>
                <button
                  type="button"
                  className="btn-close-modal"
                  aria-label="Cerrar formulario"
                  onClick={() => setModalIncidenciaAbierto(false)}
                  disabled={guardandoIncidencia}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleRegistrarIncidencia} className="modal-form">
                {errorIncidencia && (
                  <div className="form-error-msg" role="alert">
                    <AlertCircle size={14} />
                    <span>{errorIncidencia}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Tipo de incidencia</label>
                  <input
                    type="text"
                    className="form-input"
                    value={nuevaIncidencia.tipo}
                    maxLength={30}
                    required
                    onChange={(e) =>
                      setNuevaIncidencia((actual) => ({ ...actual, tipo: e.target.value }))
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <textarea
                    className="form-input"
                    value={nuevaIncidencia.descripcion}
                    maxLength={200}
                    rows={4}
                    required
                    onChange={(e) =>
                      setNuevaIncidencia((actual) => ({ ...actual, descripcion: e.target.value }))
                    }
                  />
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-cancelar"
                    onClick={() => setModalIncidenciaAbierto(false)}
                    disabled={guardandoIncidencia}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-guardar"
                    disabled={guardandoIncidencia}
                  >
                    {guardandoIncidencia ? "Guardando..." : "Guardar incidencia"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DOCUMENTO */}
        {modalDocAbierto && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <div>
                  <h3 className="modal-title">Registrar Documento</h3>
                  <p className="modal-subtitle">Adjunta nuevos documentos de soporte del proveedor</p>
                </div>
                <button className="btn-close-modal" onClick={() => setModalDocAbierto(false)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleRegistrarDocumento} className="modal-form">
                {errorFormDoc && (
                  <div className="form-error-msg">
                    <AlertCircle size={14} />
                    <span>{errorFormDoc}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Tipo de Documento</label>
                  <select
                    className="form-input"
                    value={nuevoDoc.tipoDocumento}
                    onChange={(e) =>
                      setNuevoDoc({ ...nuevoDoc, tipoDocumento: e.target.value })
                    }
                  >
                    <option value="Ficha RUC">Ficha RUC</option>
                    <option value="Certificado de Homologación">Certificado de Homologación</option>
                    <option value="Licencia de Funcionamiento">Licencia de Funcionamiento</option>
                    <option value="Certificación ISO">Certificación ISO</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Número de Documento</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. 20601234567 / CH-2026-101"
                    value={nuevoDoc.numeroDocumento}
                    onChange={(e) =>
                      setNuevoDoc({ ...nuevoDoc, numeroDocumento: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    className="form-input"
                    value={nuevoDoc.fechaVencimiento}
                    onChange={(e) =>
                      setNuevoDoc({ ...nuevoDoc, fechaVencimiento: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Archivo Adjunto (Simulado)</label>
                  <div className="upload-dropzone">
                    <Upload size={20} className="upload-icon" />
                    <span className="upload-text">
                      {nuevoDoc.archivoNombre || "Haz clic o arrastra un archivo PDF para adjuntar"}
                    </span>
                    <input
                      type="file"
                      className="file-input-hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setNuevoDoc({
                            ...nuevoDoc,
                            archivoNombre: e.target.files[0].name,
                          });
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-cancelar"
                    onClick={() => setModalDocAbierto(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-guardar">
                    Guardar Documento
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Catalogo;