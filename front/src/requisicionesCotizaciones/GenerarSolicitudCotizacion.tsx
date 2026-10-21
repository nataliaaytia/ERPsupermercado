
import { useState } from "react";
import type { Dispatch } from "react";

import type {
  AccionCompras,
} from "./modeloCompras";

import type {
  Requisicion,
} from "./tipos";

import { codigoRequisicion } from "./formatoRequisicion";

interface Props {
  requisiciones: Requisicion[];
  hoy: string;
  dispatch: Dispatch<AccionCompras>;
}

export default function GenerarSolicitudCotizacion({
  requisiciones,
  hoy,
  dispatch,
}: Props) {
  const [requisicionId, setRequisicionId] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");

  const aprobadas = requisiciones.filter(
    requisicion => requisicion.estado === "Aprobada",
  );

  return (
    <>
      <h2>Generar solicitud de cotización</h2>

      {aprobadas.length === 0 && (
        <p className="selector-proveedores-vacio">
          Primero debes aprobar una requisición.
        </p>
      )}

      <label>
        Requisición aprobada

        <select
          value={requisicionId}
          onChange={event =>
            setRequisicionId(event.target.value)
          }
        >
          <option value="">
            Seleccionar requisición
          </option>

          {aprobadas.map(requisicion => (
            <option
              key={requisicion.idRequisicion}
              value={requisicion.idRequisicion}
            >
              {codigoRequisicion(requisicion.idRequisicion)}
              {" · "}
              {requisicion.observacion}
            </option>
          ))}
        </select>
      </label>

      <label>
        Fecha límite

        <input
          className="formulario-requisicion__input"
          type="date"
          min={hoy}
          value={fechaLimite}
          onChange={event =>
            setFechaLimite(event.target.value)
          }
        />
      </label>

      <button
        type="button"
        className="selector-proveedores-boton"
        disabled={!requisicionId || !fechaLimite}
        onClick={() =>
          dispatch({
            tipo: "generar",
            requisicion: Number(requisicionId),
            fechaLimite,
            hoy,
          })
        }
      >
        Generar solicitud
      </button>
    </>
  );
}
