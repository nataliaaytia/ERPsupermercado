//NATALIA - SCRUM 524

import { useState } from "react";
import type { FormEvent } from "react";
import type {
  CondicionesLogisticas,
  OrdenCompra,
} from "../tipos";
import {
  guardarCondicionesLogisticas,
  puedeEditarLogistica,
} from "../servicios/condicionesLogisticas";

interface Props {
  ordenes: OrdenCompra[];
  onGuardar: (ordenes: OrdenCompra[]) => void;
}

interface FormularioProps {
  orden: OrdenCompra;
  onGuardar: Props["onGuardar"];
}

function FormularioLogistica({
  orden,
  onGuardar,
}: FormularioProps) {
  const [datos, setDatos] = useState<CondicionesLogisticas>(
    () => ({
      destino: orden.condicionesLogisticas?.destino ?? "",
      horario: orden.condicionesLogisticas?.horario ?? "",
      responsableEntrega:
        orden.condicionesLogisticas?.responsableEntrega ?? "",
    }),
  );

  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const editable = puedeEditarLogistica(orden);
  const registradas = orden.condicionesLogisticas;

  function cambiar(
    campo: keyof CondicionesLogisticas,
    valor: string,
  ) {
    setDatos(actuales => ({
      ...actuales,
      [campo]: valor,
    }));
    setError("");
  }

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (guardando) return;
    setError("");
    setGuardando(true);

    try {
      const actualizadas = await guardarCondicionesLogisticas(
        orden.idOrden,
        datos,
      );

      setDatos({
        destino: datos.destino.trim(),
        horario: datos.horario.trim(),
        responsableEntrega: datos.responsableEntrega.trim(),
      });

      onGuardar(actualizadas);
    } catch (fallo) {
      setError(
        fallo instanceof Error
          ? fallo.message
          : "No se pudieron guardar las condiciones logísticas.",
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <p>
        <strong>{orden.numero}</strong>
        {" · "}
        {orden.estado}
      </p>

      {registradas ? (
        <div>
          <h3>Condiciones registradas</h3>

          <dl>
            <dt>Destino</dt>
            <dd>{registradas.destino}</dd>

            <dt>Horario</dt>
            <dd>{registradas.horario}</dd>

            <dt>Responsable de entrega</dt>
            <dd>{registradas.responsableEntrega}</dd>
          </dl>
        </div>
      ) : (
        <p>
          Esta orden todavía no tiene condiciones logísticas.
        </p>
      )}

      {editable ? (
        <form onSubmit={guardar} noValidate>
          <fieldset disabled={guardando}>
            <label className="campo">
              Destino
              <input
                type="text"
                value={datos.destino}
                onChange={evento =>
                  cambiar("destino", evento.target.value)
                }
                placeholder="Ej. Almacén central, entrada de carga"
                required
              />
            </label>

            <label className="campo">
              Horario de entrega
              <input
                type="text"
                value={datos.horario}
                onChange={evento =>
                  cambiar("horario", evento.target.value)
                }
                placeholder="Ej. Lunes a viernes, de 08:00 a 12:00"
                required
              />
            </label>

            <label className="campo">
              Responsable de entrega
              <input
                type="text"
                value={datos.responsableEntrega}
                onChange={evento =>
                  cambiar(
                    "responsableEntrega",
                    evento.target.value,
                  )
                }
                required
              />
            </label>

            <button type="submit">
              {guardando ? "Procesando…" : "Guardar condiciones"}
            </button>

            {error && (
              <p
                className="alerta alerta--error"
                role="alert"
              >
                {error}
              </p>
            )}
          </fieldset>
        </form>
      ) : (
        <p>
          Esta orden está disponible solo para consulta.
        </p>
      )}
    </>
  );
}

export default function CondicionesLogisticasOrden({
  ordenes,
  onGuardar,
}: Props) {
  const [idOrden, setIdOrden] = useState("");

  const orden = ordenes.find(
    item => String(item.idOrden) === idOrden,
  );

  return (
    <section className="tarjeta">
      <h2>Condiciones logísticas</h2>

      {ordenes.length === 0 ? (
        <p>
          Todavía no hay órdenes de compra disponibles.
        </p>
      ) : (
        <label className="campo">
          Orden de compra
          <select
            value={idOrden}
            onChange={evento =>
              setIdOrden(evento.target.value)
            }
          >
            <option value="">
              Selecciona una orden
            </option>

            {ordenes.map(item => (
              <option
                key={item.idOrden}
                value={item.idOrden}
              >
                {item.numero}
                {" · "}
                {item.estado}
              </option>
            ))}
          </select>
        </label>
      )}

      {orden && (
        <FormularioLogistica
          key={orden.idOrden}
          orden={orden}
          onGuardar={onGuardar}
        />
      )}
    </section>
  );
}