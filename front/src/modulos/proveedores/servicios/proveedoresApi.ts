/**
 * Conexión con el microservicio ms-proveedores-catalogo.
 * Convierte las respuestas del backend al modelo que usan las pantallas.
 */
import { http } from '../../../servicios/api/clienteHttp';
import { endpoints } from '../../../servicios/api/endpoints';
import { fechaHoy, sumarDias } from '../../../utilidades/fechas';
import type { DatosProveedor, Documento, EstadoProveedor, ProductoCatalogo, Proveedor } from '../tipos';

/* ---------- Respuestas del backend ---------- */

interface ProveedorApi {
  idProveedor: number;
  nitRuc: string;
  razonSocial: string;
  direccion: string;
  telefono: string;
  correo: string;
  estado: string;
  validado: boolean | null;
  fechaValidacion: string | null;
}

interface ProductoCatalogoApi {
  idProducto: number;
  codigoSku: string;
  descripcion: string;
  categoria: string;
  unidad: string;
  precioReferencial: number;
  estadoProducto: string;
  condiciones: string;
  fechaInicio: string;
  fechaFin: string;
}

interface DetalleProveedorApi extends ProveedorApi {
  productos: ProductoCatalogoApi[];
}

interface DocumentoApi {
  idDocumento: number;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaVencimiento: string;
  archivo: string;
}

interface IndicadoresApi {
  idProveedor: number;
  porcentajeCumplimiento: number | null;
  porcentajeCalidad: number | null;
  cantidadRetrasos: number | null;
}

export interface FrecuenciaMensualApi {
  mes: string;
  ordenes: number;
}

export interface ValidacionProveedorApi {
  idProveedor: number;
  valido: boolean;
  mensaje: string;
  errores: string[];
}

/* ---------- Conversión al modelo del frontend ---------- */

/** El backend crea los proveedores como "Registrado"; en pantalla equivale a "Pendiente". */
function aEstadoFrontend(estado: string): EstadoProveedor {
  if (estado === 'Activo' || estado === 'Inactivo' || estado === 'Observado') return estado;
  return 'Pendiente';
}

function aDocumento(documento: DocumentoApi): Documento {
  return {
    idDocumento: documento.idDocumento,
    tipoDocumento: documento.tipoDocumento,
    numeroDocumento: documento.numeroDocumento,
    fechaVencimiento: documento.fechaVencimiento,
    archivo: documento.archivo,
    estadoValidacion: documento.fechaVencimiento >= fechaHoy() ? 'Válido' : 'Vencido',
  };
}

function aProducto(producto: ProductoCatalogoApi): ProductoCatalogo {
  return {
    idProducto: producto.idProducto,
    sku: producto.codigoSku,
    nombre: producto.descripcion,
    categoria: producto.categoria,
    descripcion: producto.condiciones,
    precioPactado: Number(producto.precioReferencial),
    // El microservicio no registra plazo ni stock por producto.
    tiempoEntregaEstimado: 'Según condición comercial',
    stockDisponible: null,
    unidadMedida: producto.unidad,
  };
}

function aProveedor(detalle: DetalleProveedorApi, documentos: DocumentoApi[]): Proveedor {
  return {
    idProveedor: detalle.idProveedor,
    nitRuc: detalle.nitRuc,
    razonSocial: detalle.razonSocial,
    direccion: detalle.direccion,
    telefono: detalle.telefono,
    correo: detalle.correo,
    estado: aEstadoFrontend(detalle.estado),
    // Indicadores que este microservicio todavía no expone en el listado.
    puntajeDesempeno: 0,
    ordenesCompra: 0,
    montoTotalComprado: 0,
    tiempoPromedioDias: 0,
    descuentoVolumen: [],
    documentos: documentos.map(aDocumento),
    catalogoProductos: detalle.productos.map(aProducto),
  };
}

/* ---------- Operaciones ---------- */

/** Proveedor completo: datos, catálogo y documentos. */
export async function obtenerProveedor(idProveedor: number): Promise<Proveedor> {
  const [detalle, documentos] = await Promise.all([
    http.get<DetalleProveedorApi>(endpoints.proveedores.catalogo(idProveedor)),
    http.get<DocumentoApi[]>(endpoints.proveedores.documentos(idProveedor)),
  ]);
  return aProveedor(detalle, documentos);
}

export async function listarProveedores(): Promise<Proveedor[]> {
  const [proveedores, indicadores] = await Promise.all([
    http.get<ProveedorApi[]>(endpoints.proveedores.listar),
    http.get<IndicadoresApi[]>(endpoints.proveedores.indicadores),
  ]);
  const completos = await Promise.all(proveedores.map((proveedor) => obtenerProveedor(proveedor.idProveedor)));
  return completos
    .map((proveedor) => {
      const propio = indicadores.find((item) => item.idProveedor === proveedor.idProveedor);
      return propio
        ? {
            ...proveedor,
            indicadores: {
              porcentajeAceptados: Number(propio.porcentajeCalidad ?? 0),
              porcentajeEntregasCompletas: Number(propio.porcentajeCumplimiento ?? 0),
              cantidadRetrasos: Number(propio.cantidadRetrasos ?? 0),
            },
          }
        : proveedor;
    })
    .sort((a, b) => a.idProveedor - b.idProveedor);
}

/** Órdenes de compra por mes (gráfico del ranking). */
export function obtenerFrecuenciaMensual(): Promise<FrecuenciaMensualApi[]> {
  return http.get<FrecuenciaMensualApi[]>(endpoints.proveedores.frecuenciaMensual);
}

export async function registrarProveedor(datos: DatosProveedor): Promise<Proveedor> {
  const creado = await http.post<ProveedorApi>(endpoints.proveedores.listar, datos);
  return obtenerProveedor(creado.idProveedor);
}

export async function cambiarEstadoProveedor(idProveedor: number, estado: EstadoProveedor): Promise<void> {
  await http.patch(endpoints.proveedores.cambiarEstado(idProveedor, estado));
}

export function validarProveedor(idProveedor: number): Promise<ValidacionProveedorApi> {
  return http.post<ValidacionProveedorApi>(endpoints.proveedores.validar(idProveedor));
}

export async function registrarDocumento(idProveedor: number, documento: Documento): Promise<void> {
  await http.post(endpoints.proveedores.documentos(idProveedor), {
    tipoDocumento: documento.tipoDocumento,
    numeroDocumento: documento.numeroDocumento,
    fechaVencimiento: documento.fechaVencimiento,
    archivo: documento.archivo,
  });
}

/** Asocia un producto al catálogo del proveedor con vigencia de un año. */
export async function asociarProducto(idProveedor: number, idProducto: number): Promise<void> {
  const hoy = fechaHoy();
  await http.post(endpoints.proveedores.asociarProducto(idProveedor, idProducto), {
    fechaInicio: hoy,
    fechaFin: sumarDias(hoy, 365),
    condiciones: 'Precio y condiciones según catálogo vigente',
    archivo: 'catalogo.pdf',
  });
}
