import { useState } from "react";
import type { Dispatch } from "react";

import type { AccionCompras } from "./modeloCompras";
import type {
  ProveedorReferencia,
  SolicitudCotizacion,
} from "./tipos";

interface Props {
  proveedores: ProveedorReferencia[];
  solicitud: SolicitudCotizacion;
  hoy: string;
  dispatch: Dispatch<AccionCompras>;
}

export default function AsociarProveedores({
  proveedores,
  solicitud,
  hoy,
  dispatch,
}: Props) {
  const [seleccionados, setSeleccionados] =
    useState<number[]>([]);
  const [busqueda, setBusqueda] = useState("");

  const activos = proveedores.filter(
    proveedor => proveedor.estado === "Activo",
  );

  const proveedoresVisibles = activos.filter(proveedor => {
    const texto = busqueda.trim().toLowerCase();

    return (
      proveedor.razonSocial.toLowerCase().includes(texto) ||
      proveedor.nitRuc.includes(texto)
    );
  });

  const cambiarSeleccion = (idProveedor: number) => {
    if (solicitud.estado !== "Generada") return;

    setSeleccionados(actuales =>
      actuales.includes(idProveedor)
        ? actuales.filter(id => id !== idProveedor)
        : [...actuales, idProveedor],
    );
  };

  const asociarProveedores = () => {
    if (
      solicitud.estado !== "Generada" ||
      seleccionados.length === 0
    ) {
      return;
    }

    // Si algún proveedor dejó de estar activo,
    // el reductor rechazará la operación completa.
    const seleccion = proveedores.filter(proveedor =>
      seleccionados.includes(proveedor.idProveedor),
    );

    if (seleccion.length !== seleccionados.length) {
      return;
    }

    dispatch({
      tipo: "enviar",
      id: solicitud.idSolicitud,
      proveedores: seleccion,
      hoy,
    });
  };

  return (
    <>
      <h3>Proveedores disponibles</h3>

      <input
        type="search"
        placeholder="Buscar por razón social o NIT"
        aria-label="Buscar proveedores"
        value={busqueda}
        onChange={event => setBusqueda(event.target.value)}
      />

      <div className="selector-proveedores-lista">
        {proveedoresVisibles.length === 0 ? (
          <p>No se encontraron proveedores disponibles.</p>
        ) : (
          proveedoresVisibles.map(proveedor => (
            <label
              key={proveedor.idProveedor}
              className="selector-proveedor"
            >
              <input
                type="checkbox"
                checked={seleccionados.includes(proveedor.idProveedor)}
                onChange={() =>
                  cambiarSeleccion(proveedor.idProveedor)
                }
              />

              <span>
                <strong>{proveedor.razonSocial}</strong>
                <small>NIT/RUC: {proveedor.nitRuc}</small>
              </span>
            </label>
          ))
        )}
      </div>

      <div className="selector-proveedores-acciones">
        <p>Proveedores seleccionados: {seleccionados.length}</p>

        <button
          type="button"
          className="selector-proveedores-boton"
          disabled={
            seleccionados.length === 0 ||
            solicitud.fechaLimite < hoy
          }
          onClick={asociarProveedores}
        >
          Asociar proveedores
        </button>
      </div>

      {solicitud.fechaLimite < hoy && (
        <p role="alert">
          La fecha límite de esta solicitud ya venció.
        </p>
      )}
    </>
  );
}
