import { useState } from 'react';
import type { DatosProveedor, Documento, EstadoProveedor, ProductoCatalogo, Proveedor } from '../tipos';
import { actualizarCompras, notificarMensaje, siguienteId } from '../../../estado/almacenCompras';
import { useCompras } from '../../../estado/useCompras';
import { asociarProductos } from '../servicios/funcionesAuxiliares';
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

/**
 * Proveedores del almacén global. Los cambios hechos aquí (altas, estados,
 * documentos, catálogo) se ven también en Requisiciones y Órdenes de compra.
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

  const cambiarEstado = (estado: EstadoProveedor) => {
    actualizarProveedor(proveedorSeleccionado.idProveedor, (proveedor) => ({ ...proveedor, estado }));
    notificarMensaje(`${proveedorSeleccionado.razonSocial} ahora está "${estado}".`);
  };

  const registrarDocumento = (documento: Documento) => {
    actualizarProveedor(proveedorSeleccionado.idProveedor, (proveedor) => ({
      ...proveedor,
      documentos: [...proveedor.documentos, documento],
    }));
  };

  const asociar = (idProveedor: number, productos: ProductoCatalogo[]) => {
    actualizarCompras((actual) => ({
      ...actual,
      proveedores: asociarProductos(actual.proveedores, idProveedor, productos),
    }));
    notificarMensaje(`Se asociaron ${productos.length} producto(s) al catálogo del proveedor.`);
  };

  const registrarProveedor = (datos: DatosProveedor): string | null => {
    const normalizados = normalizarProveedor(datos);
    const errores = validarProveedor(
      normalizados,
      proveedores.map((proveedor) => proveedor.nitRuc),
    );
    if (Object.keys(errores).length) {
      return Object.values(errores)[0] ?? 'Revisa los datos del proveedor.';
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
    registrarDocumento,
    asociar,
    registrarProveedor,
  };
}
