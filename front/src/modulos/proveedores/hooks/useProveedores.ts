import { useState } from 'react';
import type { DatosProveedor, Documento, EstadoProveedor, ProductoCatalogo, Proveedor } from '../tipos';
import { actualizarCompras, notificarMensaje, siguienteId } from '../../../estado/almacenCompras';
import { useCompras } from '../../../estado/useCompras';
import { conexion } from '../../../servicios/api/configuracion';
import { asociarProductos } from '../servicios/funcionesAuxiliares';
import * as api from '../servicios/proveedoresApi';
import { refrescarProveedor } from '../servicios/sincronizacionProveedores';
import { normalizarProveedor, validarProveedor } from '../servicios/validacionProveedor';

const CLAVE_SELECCION = 'erp-proveedor-seleccionado';

function leerSeleccion(): number | null {
  try {
    const valor = Number(sessionStorage.getItem(CLAVE_SELECCION));
    return Number.isInteger(valor) && valor > 0 ? valor : null;
  } catch {
    return null;
  }
}

function actualizarProveedor(idProveedor: number, cambio: (proveedor: Proveedor) => Proveedor) {
  actualizarCompras((actual) => ({
    ...actual,
    proveedores: actual.proveedores.map((proveedor) =>
      proveedor.idProveedor === idProveedor ? cambio(proveedor) : proveedor,
    ),
  }));
}

function mensajeDeError(fallo: unknown, porDefecto: string): string {
  return fallo instanceof Error && fallo.message ? fallo.message : porDefecto;
}

/**
 * Proveedores del almacén global. Los cambios hechos aquí (altas, estados,
 * documentos, catálogo) se ven también en Requisiciones y Órdenes de compra.
 *
 * Cada operación se envía
 * al microservicio de proveedores y luego se refresca el proveedor afectado.
 */
export function useProveedores() {
  const { proveedores } = useCompras();
  const [idSeleccionado, setIdSeleccionadoLocal] = useState<number | null>(leerSeleccion);

  const proveedorSeleccionado =
    proveedores.find((proveedor) => proveedor.idProveedor === idSeleccionado) ?? proveedores[0];

  const setIdSeleccionado = (id: number) => {
    setIdSeleccionadoLocal(id);
    try {
      sessionStorage.setItem(CLAVE_SELECCION, String(id));
    } catch {
      // Selección solo en memoria.
    }
  };

  const cambiarEstado = async (estado: EstadoProveedor) => {
    const { idProveedor, razonSocial } = proveedorSeleccionado;
    if (conexion.proveedores) {
      try {
        await api.cambiarEstadoProveedor(idProveedor, estado);
        await refrescarProveedor(idProveedor);
      } catch (fallo) {
        notificarMensaje(mensajeDeError(fallo, 'No se pudo cambiar el estado.'), 'error');
        return;
      }
    } else {
      actualizarProveedor(idProveedor, (proveedor) => ({ ...proveedor, estado }));
    }
    notificarMensaje(`${razonSocial} ahora está "${estado}".`);
  };

  /** Guarda en el servidor el resultado de la validación (marca de proveedor validado). */
  const validarEnServidor = async () => {
    if (!conexion.proveedores) return;
    try {
      const resultado = await api.validarProveedor(proveedorSeleccionado.idProveedor);
      notificarMensaje(resultado.mensaje, resultado.valido ? 'exito' : 'error');
    } catch (fallo) {
      notificarMensaje(mensajeDeError(fallo, 'No se pudo validar el proveedor.'), 'error');
    }
  };

  const registrarDocumento = async (documento: Documento) => {
    const { idProveedor } = proveedorSeleccionado;
    if (conexion.proveedores) {
      try {
        await api.registrarDocumento(idProveedor, documento);
        await refrescarProveedor(idProveedor);
        notificarMensaje('Documento registrado.');
      } catch (fallo) {
        notificarMensaje(mensajeDeError(fallo, 'No se pudo registrar el documento.'), 'error');
      }
      return;
    }
    actualizarProveedor(idProveedor, (proveedor) => ({
      ...proveedor,
      documentos: [...proveedor.documentos, documento],
    }));
  };

  const asociar = async (idProveedor: number, productos: ProductoCatalogo[]) => {
    if (conexion.proveedores) {
      try {
        for (const producto of productos) {
          await api.asociarProducto(idProveedor, producto.idProducto);
        }
        await refrescarProveedor(idProveedor);
      } catch (fallo) {
        await refrescarProveedor(idProveedor).catch(() => undefined);
        notificarMensaje(mensajeDeError(fallo, 'No se pudieron asociar los productos.'), 'error');
        return;
      }
    } else {
      actualizarCompras((actual) => ({
        ...actual,
        proveedores: asociarProductos(actual.proveedores, idProveedor, productos),
      }));
    }
    notificarMensaje(`Se asociaron ${productos.length} producto(s) al catálogo del proveedor.`);
  };

  /** Devuelve un mensaje de error, o null si el proveedor se registró. */
  const registrarProveedor = async (datos: DatosProveedor): Promise<string | null> => {
    const normalizados = normalizarProveedor(datos);
    const errores = validarProveedor(
      normalizados,
      proveedores.map((proveedor) => proveedor.nitRuc),
    );
    if (Object.keys(errores).length) {
      return Object.values(errores)[0] ?? 'Revisa los datos del proveedor.';
    }

    if (conexion.proveedores) {
      try {
        const creado = await api.registrarProveedor(normalizados);
        actualizarCompras((actual) => ({ ...actual, proveedores: [...actual.proveedores, creado] }));
        setIdSeleccionado(creado.idProveedor);
        return null;
      } catch (fallo) {
        return mensajeDeError(fallo, 'No se pudo registrar el proveedor.');
      }
    }

    const nuevo: Proveedor = {
      ...normalizados,
      idProveedor: siguienteId(proveedores.map((proveedor) => proveedor.idProveedor)),
      estado: 'Pendiente',
      puntajeDesempeno: 0,
      ordenesCompra: 0,
      montoTotalComprado: 0,
      documentos: [],
      catalogoProductos: [],
      descuentoVolumen: [],
      tiempoPromedioDias: 0,
    };

    actualizarCompras((actual) => ({ ...actual, proveedores: [...actual.proveedores, nuevo] }));
    setIdSeleccionado(nuevo.idProveedor);
    return null;
  };

  return {
    proveedores,
    proveedorSeleccionado,
    setIdSeleccionado,
    cambiarEstado,
    validarEnServidor,
    registrarDocumento,
    asociar,
    registrarProveedor,
  };
}
