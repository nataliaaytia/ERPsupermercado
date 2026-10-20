import { useEffect, useState } from "react";

import FormularioRequisicion from "./FormularioRequisicion";
import EditarRequisicion from "./editarRequisicion";
import MenuLateral from "./MenuLateral";
import ListaRequisiciones from "./ListaRequisiciones";
import ValidarRequisicion from "./ValidarRequisicion";
import SelectorProveedores from "./SelectorProveedores";
import ConsolidarRequisiciones from "./ConsolidarRequisiciones";

import {
  useRequisiciones,
  fechaHoy,
} from "./useRequisiciones";

import { proveedoresIniciales } from "../catalogo/datosProveedores";
import { codigoRequisicion } from "./formatoRequisicion";

import "./Requisiciones.css";

const opciones = [
  "Nueva requisición",
  "Aprobar o anular requisición",
  "Requisiciones registradas",
  "Solicitudes y ofertas",
  "Consolidar requisiciones",
];

const CLAVE_PESTANA = "requisiciones-pestana";

const cargarPestana = (): number => {
  try {
    const guardada = sessionStorage.getItem(CLAVE_PESTANA);

    if (guardada === null) return 0;

    const indice = Number(guardada);

    return (
      Number.isInteger(indice) &&
      indice >= 0 &&
      indice < opciones.length
    )
      ? indice
      : 0;
  } catch {
    return 0;
  }
};

export const Requisiciones = () => {
  const compras = useRequisiciones();
  const { dispatch } = compras;

  const [opcionActiva, setOpcionActiva] =
    useState(cargarPestana);

  const [menuAbierto, setMenuAbierto] =
    useState(true);

  const [idRequisicion, setIdRequisicion] =
    useState<number | null>(null);

  const [idEdicion, setIdEdicion] =
    useState<number | null>(null);

  const [fechaLimite, setFechaLimite] =
    useState("");

  const [requisicionEnProceso, setRequisicionEnProceso] =
    useState<number | null>(null);

  const [solicitudActiva, setSolicitudActiva] =
    useState<number | null>(null);

  const [errorFormulario, setErrorFormulario] =
    useState("");

  const requisicionSeleccionada =
    compras.requisiciones.find(
      r => r.idRequisicion === idRequisicion,
    );

  const requisicionEnEdicion =
    compras.requisiciones.find(
      r => r.idRequisicion === idEdicion,
    );

  const puedeGenerar =
    requisicionSeleccionada?.estado === "Aprobada" &&
    !compras.solicitudes.some(
      s => s.requisicion === idRequisicion,
    );

  useEffect(() => {
    if (requisicionEnProceso === null) return;

    const solicitudCreada = compras.solicitudes.find(
      s =>
        s.requisicion === requisicionEnProceso &&
        s.estado === "Generada",
    );

    if (!solicitudCreada) return;

    setSolicitudActiva(solicitudCreada.idSolicitud);
    setRequisicionEnProceso(null);
    setIdRequisicion(null);
    setIdEdicion(null);
    setFechaLimite("");
    setErrorFormulario("");
    setOpcionActiva(3);

    dispatch({ tipo: "limpiarMensaje" });

    try {
      sessionStorage.setItem(CLAVE_PESTANA, "3");
    } catch { }
  }, [
    compras.solicitudes,
    requisicionEnProceso,
    dispatch,
  ]);

  const elegirOpcion = (indice: number) => {
    dispatch({ tipo: "limpiarMensaje" });

    setOpcionActiva(indice);
    setIdEdicion(null);
    setErrorFormulario("");
    setRequisicionEnProceso(null);

    if (indice !== 2) {
      setIdRequisicion(null);
      setFechaLimite("");
    }

    try {
      sessionStorage.setItem(
        CLAVE_PESTANA,
        String(indice),
      );
    } catch { }
  };

  const abrirGeneracion = (id: number) => {
    dispatch({ tipo: "limpiarMensaje" });

    setIdEdicion(null);
    setIdRequisicion(id);
    setFechaLimite("");
    setErrorFormulario("");
    setRequisicionEnProceso(null);
  };

  const cerrarGeneracion = () => {
    setIdRequisicion(null);
    setFechaLimite("");
    setErrorFormulario("");
    setRequisicionEnProceso(null);
  };

  const generarSolicitud = () => {
    if (idRequisicion === null || !puedeGenerar) {
      setErrorFormulario(
        "La requisición no está disponible para generar una cotización.",
      );
      return;
    }

    if (!fechaLimite || fechaLimite < fechaHoy()) {
      setErrorFormulario(
        "Selecciona una fecha límite válida.",
      );
      return;
    }

    setErrorFormulario("");
    setRequisicionEnProceso(idRequisicion);

    dispatch({
      tipo: "generar",
      requisicion: idRequisicion,
      fechaLimite,
      hoy: fechaHoy(),
    });
  };

  return (
    <div className="requisiciones-container">
      <MenuLateral
        opciones={opciones}
        opcionActiva={opcionActiva}
        abierto={menuAbierto}
        onAbrirCerrar={() =>
          setMenuAbierto(actual => !actual)
        }
        onElegir={elegirOpcion}
      />

      <section className="requisiciones-contenido">
        <header className="requisiciones-header">
          <p className="requisiciones-subtitulo">
            Compras
          </p>

          <h1 className="requisiciones-titulo">
            {opciones[opcionActiva]}
          </h1>
        </header>

        {compras.mensaje && (
          <p
            role={
              compras.tipoMensaje === "error"
                ? "alert"
                : "status"
            }
            className={
              "requisiciones-aviso " +
              `requisiciones-aviso--${compras.tipoMensaje}`
            }
          >
            {compras.mensaje}
          </p>
        )}

        {opcionActiva === 0 && (
          <div className="requisiciones-tarjeta">
            <FormularioRequisicion
              onGuardar={compras.registrarRequisicion}
            />
          </div>
        )}

        {opcionActiva === 1 && (
          <ValidarRequisicion
            requisiciones={compras.requisiciones}
            onValidar={compras.validar}
            onAnular={compras.anular}
          />
        )}

        {opcionActiva === 2 && (
          <>
            <div className="requisiciones-tarjeta">
              <ListaRequisiciones
                requisiciones={compras.requisiciones}
                solicitudes={compras.solicitudes}
                idEnEdicion={idEdicion}
                onGenerarCotizacion={abrirGeneracion}
                onEditar={id => {
                  dispatch({ tipo: "limpiarMensaje" });
                  cerrarGeneracion();
                  setIdEdicion(id);
                }}
                onCambiarPrioridad={(id, prioridad) =>
                  dispatch({
                    tipo: "cambiarPrioridad",
                    id,
                    prioridad,
                  })
                }
              />
            </div>

            {requisicionEnEdicion && (
              <div className="requisiciones-tarjeta">
                <EditarRequisicion
                  key={requisicionEnEdicion.idRequisicion}
                  requisicion={requisicionEnEdicion}
                  bloqueada={
                    requisicionEnEdicion.estado !==
                    "Pendiente" ||
                    compras.solicitudes.some(
                      s =>
                        s.requisicion ===
                        requisicionEnEdicion.idRequisicion,
                    )
                  }
                  onGuardar={datos =>
                    dispatch({
                      tipo: "modificar",
                      id: requisicionEnEdicion.idRequisicion,
                      datos,
                    })
                  }
                  onCancelar={() => setIdEdicion(null)}
                />
              </div>
            )}

            {idRequisicion !== null && (
              <div className="requisiciones-tarjeta">
                <div className="requisiciones-cotizacion">
                  <h2>
                    Generar solicitud de cotización
                  </h2>

                  <p>
                    Requisición:{" "}
                    <strong className="requisiciones-cotizacion__codigo">
                      {codigoRequisicion(idRequisicion)}
                    </strong>
                  </p>

                  <p>
                    Establece la fecha límite para recibir
                    las ofertas de los proveedores.
                  </p>

                  <div className="requisiciones-cotizacion__campo">
                    <label htmlFor="fecha-limite-cotizacion">
                      Fecha límite de cotización
                    </label>

                    <input
                      id="fecha-limite-cotizacion"
                      type="date"
                      min={fechaHoy()}
                      value={fechaLimite}
                      onChange={event => {
                        setFechaLimite(event.target.value);
                        setErrorFormulario("");
                      }}
                    />
                  </div>

                  {errorFormulario && (
                    <p
                      role="alert"
                      className="requisiciones-cotizacion__error"
                    >
                      {errorFormulario}
                    </p>
                  )}

                  <div className="requisiciones-cotizacion__acciones">
                    <button
                      type="button"
                      className="requisiciones-cotizacion__cancelar"
                      onClick={cerrarGeneracion}
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      className="requisiciones-cotizacion__generar"
                      disabled={
                        !puedeGenerar ||
                        !fechaLimite ||
                        fechaLimite < fechaHoy()
                      }
                      onClick={generarSolicitud}
                    >
                      Generar cotización
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {opcionActiva === 3 && (
          <div className="requisiciones-tarjeta">
            <SelectorProveedores
              key={solicitudActiva ?? "sin-seleccion"}
              proveedores={proveedoresIniciales}
              estado={compras}
              dispatch={dispatch}
              solicitudInicialId={solicitudActiva}
            />
          </div>
        )}
        {opcionActiva === 4 && (
          <div className="requisiciones-tarjeta">
            <ConsolidarRequisiciones
              estado={compras}
              dispatch={dispatch}
            />
          </div>
        )}
      </section>
    </div>
  );
};

export default Requisiciones;