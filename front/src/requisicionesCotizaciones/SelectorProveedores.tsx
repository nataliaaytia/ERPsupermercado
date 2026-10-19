
import { useState } from "react";
import type { Proveedor } from "../catalogo/tipos";
import { cotizacionesEjemplo } from "./cotizacionesEjemplo";
import "./SelectorProveedores.css";

interface SelectorProveedoresProps {
  proveedores: Proveedor[];
  asociaciones: Record<string, number[]>;
  onAsociar: (cotizacionId: string, ids: number[]) => void;
}

export default function SelectorProveedores({
  proveedores,
  asociaciones,
  onAsociar,
}: SelectorProveedoresProps) {
  const [busqueda, setBusqueda] = useState("");
  const [cotizacionId, setCotizacionId] = useState("");
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [mensaje, setMensaje] = useState("");

  const proveedoresValidos = proveedores.filter(
    (proveedor) =>
      proveedor.estado === "Activo" &&
      (proveedor.razonSocial
        .toLowerCase()
        .includes(busqueda.toLowerCase()) ||
        proveedor.nitRuc.includes(busqueda))
  );

  const idsAsociados = asociaciones[cotizacionId] ?? [];

  const existeAsociacion = Object.prototype.hasOwnProperty.call(
    asociaciones,
    cotizacionId
  );

  const seleccionActual = [...seleccionados].sort((a, b) => a - b);
  const seleccionGuardada = [...idsAsociados].sort((a, b) => a - b);

  const hayCambios =
    JSON.stringify(seleccionActual) !==
    JSON.stringify(seleccionGuardada);

  const cambiarCotizacion = (id: string) => {
    setCotizacionId(id);
    setSeleccionados([...(asociaciones[id] ?? [])]);
    setBusqueda("");
    setMensaje("");
  };

  const cambiarSeleccion = (idProveedor: number) => {
    setSeleccionados((actuales) =>
      actuales.includes(idProveedor)
        ? actuales.filter((id) => id !== idProveedor)
        : [...actuales, idProveedor]
    );

    setMensaje("");
  };

  const asociarProveedores = () => {
    if (!cotizacionId || seleccionados.length === 0) {
      setMensaje("Selecciona una cotización y al menos un proveedor.");
      return;
    }

    const idsValidos = seleccionados.filter((id) =>
      proveedores.some(
        (proveedor) =>
          proveedor.idProveedor === id &&
          proveedor.estado === "Activo"
      )
    );

    if (idsValidos.length !== seleccionados.length) {
      setMensaje(
        "La selección contiene proveedores que ya no están activos."
      );
      return;
    }

    onAsociar(cotizacionId, [...new Set(idsValidos)]);

    setMensaje(
      `Asociación ${existeAsociacion ? "actualizada" : "registrada"} correctamente en esta demostración.`
    );
  };

  return (
    <div className="selector-proveedores">
      <h2>Asociar proveedores a cotización</h2>

      <p>
        Selecciona una solicitud de cotización y los proveedores
        que participarán.
      </p>

      <label htmlFor="solicitud-cotizacion">
        Solicitud de cotización
      </label>

      <select
        id="solicitud-cotizacion"
        value={cotizacionId}
        onChange={(e) => cambiarCotizacion(e.target.value)}
      >
        <option value="">Seleccionar solicitud</option>

        {cotizacionesEjemplo.map((cotizacion) => (
          <option key={cotizacion.id} value={cotizacion.id}>
            {cotizacion.id} - {cotizacion.descripcion}
          </option>
        ))}
      </select>

      {cotizacionId && existeAsociacion && (
        <div className="selector-proveedores-resumen">
          <strong>Proveedores asociados actualmente</strong>

          {idsAsociados.length === 0 ? (
            <p>No hay proveedores asociados.</p>
          ) : (
            <ul>
              {idsAsociados.map((id) => {
                const proveedor = proveedores.find(
                  (item) => item.idProveedor === id
                );

                return (
                  <li key={id}>
                    {proveedor?.razonSocial ??
                      `Proveedor ${id}`}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      <h3>Proveedores disponibles</h3>

      <input
        type="search"
        placeholder="Buscar por razón social o NIT"
        aria-label="Buscar proveedores"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <div className="selector-proveedores-lista">
        {proveedoresValidos.length === 0 ? (
          <p>No se encontraron proveedores disponibles.</p>
        ) : (
          proveedoresValidos.map((proveedor) => (
            <label
              key={proveedor.idProveedor}
              className="selector-proveedor"
            >
              <input
                type="checkbox"
                checked={seleccionados.includes(
                  proveedor.idProveedor
                )}
                onChange={() =>
                  cambiarSeleccion(proveedor.idProveedor)
                }
                disabled={!cotizacionId}
              />

              <span>
                <strong>{proveedor.razonSocial}</strong>
                <small>NIT/RUC: {proveedor.nitRuc}</small>
              </span>
            </label>
          ))
        )}
      </div>

      <p>
        Proveedores seleccionados: {seleccionados.length}
      </p>

      {cotizacionId && hayCambios && (
        <p role="status">
          Tienes cambios pendientes de confirmar.
        </p>
      )}

      <button
        type="button"
        className="selector-proveedores-boton"
        disabled={
          !cotizacionId ||
          seleccionados.length === 0 ||
          (existeAsociacion && !hayCambios)
        }
        onClick={asociarProveedores}
      >
        {existeAsociacion
          ? "Actualizar asociación"
          : "Asociar proveedores"}
      </button>

      {mensaje && (
        <p
          role="status"
          className="selector-proveedores-mensaje"
        >
          {mensaje}
        </p>
      )}
    </div>
  );
}
