import { useState } from "react";
import type {
  Documento,
  EstadoProveedor,
  ProductoCatalogo,
  DatosProveedor,
  Proveedor,
} from "./tipos";
import { proveedoresIniciales } from "./datosProveedores";
import { asociarProductos } from "./funcionesAuxiliares";
import { normalizarProveedor, validarProveedor } from "./validacionProveedor";
export function useProveedores() {
  const [proveedores, setProveedores] = useState(proveedoresIniciales);
  const [idSeleccionado, setIdSeleccionado] = useState(
    proveedoresIniciales[0].idProveedor,
  );
  const proveedorSeleccionado =
    proveedores.find((proveedor) => proveedor.idProveedor === idSeleccionado) ??
    proveedores[0];
  const cambiarEstado = (estado: EstadoProveedor) => {
    setProveedores((actuales) =>
      actuales.map((proveedor) =>
        proveedor.idProveedor === idSeleccionado
          ? { ...proveedor, estado }
          : proveedor,
      ),
    );
  };
  const registrarDocumento = (documento: Documento) => {
    setProveedores((actuales) =>
      actuales.map((proveedor) =>
        proveedor.idProveedor === idSeleccionado
          ? { ...proveedor, documentos: [...proveedor.documentos, documento] }
          : proveedor,
      ),
    );
  };
  const asociar = (idProveedor: number, productos: ProductoCatalogo[]) => {
    setProveedores((actuales) =>
      asociarProductos(actuales, idProveedor, productos),
    );
  };
  const registrarProveedor = (datos: DatosProveedor): string | null => {
    const normalizados = normalizarProveedor(datos);
    const errores = validarProveedor(
      normalizados,
      proveedores.map((proveedor) => proveedor.nitRuc),
    );
    if (Object.keys(errores).length)
      return Object.values(errores)[0] ?? "Revisa los datos del proveedor.";
    const nuevo: Proveedor = {
      ...normalizados,
      idProveedor:
        Math.max(0, ...proveedores.map((proveedor) => proveedor.idProveedor)) +
        1,
      estado: "Pendiente",
      puntajeDesempeno: 0,
      ordenesCompra: 0,
      montoTotalComprado: 0,
      documentos: [],
      catalogoProductos: [],
      descuentoVolumen: [],
      tiempoPromedioDias: 0,
    };
    setProveedores((actuales) => [...actuales, nuevo]);
    setIdSeleccionado(nuevo.idProveedor);
    return null;
  };
  return {
    registrarProveedor,
    proveedores,
    proveedorSeleccionado,
    setIdSeleccionado,
    cambiarEstado,
    registrarDocumento,
    asociar,
  };
}
