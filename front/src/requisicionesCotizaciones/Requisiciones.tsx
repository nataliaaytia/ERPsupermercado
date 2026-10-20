
import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

import FormularioRequisicion from "./FormularioRequisicion";
import MenuLateral from "./MenuLateral";
import ListaRequisiciones from "./ListaRequisiciones";
import ValidarRequisicion from "./ValidarRequisicion";
import SelectorProveedores from "./SelectorProveedores";

import {
  useRequisiciones,
  fechaHoy,
} from "./useRequisiciones";

import { proveedoresIniciales } from "../catalogo/datosProveedores";
import { codigoRequisicion } from "./formatoRequisicion";

import type {
  DatosRequisicion,
  ProveedorReferencia,
} from "./tipos";

import "./Requisiciones.css";

const opciones = [
  "Nueva requisición",
  "Validar requisición",
  "Requisiciones registradas",
  "Seleccionar proveedores",
];

const CLAVE_PESTANA = "requisiciones-pestana";

const cargarPestana = (): number => {
  try {
    const guardada = sessionStorage.getItem(CLAVE_PESTANA);

    if (guardada === null) return 0;

    const indice = Number(guardada);

    return Number.isInteger(indice) &&
      indice >= 0 &&
      indice < opciones.length
      ? indice
      : 0;
  } catch {
    return 0;
  }
};

export const Requisiciones = () => {
  const {
    requisiciones,
    solicitudes,
    registrarRequisicion,
    validar,
    anular,
    dispatch,
    mensaje,
  } = useRequisiciones();

  const [opcionActiva, setOpcionActiva] =
    useState<number>(cargarPestana);

  const [menuAbierto, setMenuAbierto] = useState(true);

  const [idRequisicion, setIdRequisicion] =
    useState<number | null>(null);

  const [fechaLimite, setFechaLimite] = useState("");

  const [requisicionEnProceso, setRequisicionEnProceso] =
    useState<number | null>(null);

  const [solicitudActiva, setSolicitudActiva] =
    useState<number | null>(null);

  const [errorFormulario, setErrorFormulario] =
    useState("");

  // Identifica la sección donde se ejecutó la última operación.
  const [origenMensaje, setOrigenMensaje] =
    useState<number | null>(null);

  const requisicionSeleccionada = requisiciones.find(
    (requisicion) =>
      requisicion.idRequisicion === idRequisicion
  );

  const puedeGenerar =
    requisicionSeleccionada?.estado === "Aprobada" &&
    !solicitudes.some(
      (solicitud) =>
        solicitud.requisicion === idRequisicion
    );

  // El modelo utiliza un mensaje compartido para éxitos y errores.
  const esErrorMensaje =
    mensaje.startsWith("Solo ") ||
    mensaje.startsWith("Selecciona ") ||
    mensaje.startsWith("Corrige ") ||
    mensaje.startsWith("La ") ||
    mensaje.startsWith("El ") ||
    mensaje.startsWith("Este ") ||
    mensaje.startsWith("Esta ") ||
    mensaje.startsWith("Fecha ") ||
    mensaje.startsWith("Cotiza ");

  const mostrarMensaje =
    Boolean(mensaje) &&
    origenMensaje === opcionActiva;

  // Al generarse una solicitud, recuperamos su identificador
  // para continuar directamente con la selección de proveedores.
  useEffect(() => {
    if (requisicionEnProceso === null) {
      return;
    }

    const solicitudCreada = solicitudes.find(
      (solicitud) =>
        solicitud.requisicion === requisicionEnProceso &&
        solicitud.estado === "Generada"
    );

    if (!solicitudCreada) {
      return;
    }

    setSolicitudActiva(solicitudCreada.idSolicitud);
    setRequisicionEnProceso(null);
    setIdRequisicion(null);
    setFechaLimite("");
    setErrorFormulario("");
    setOrigenMensaje(null);
    setOpcionActiva(3);

    try {
      sessionStorage.setItem(CLAVE_PESTANA, "3");
    } catch (error) {
      console.error(
        "No se pudo guardar la pestaña activa:",
        error
      );
    }
  }, [solicitudes, requisicionEnProceso]);

  const guardar = (datos: DatosRequisicion) => {
    setOrigenMensaje(0);
    registrarRequisicion(datos);
  };

  const aprobarRequisicion = (id: number) => {
    setOrigenMensaje(1);
    validar(id);
  };

  const anularRequisicion = (id: number) => {
    setOrigenMensaje(1);
    anular(id);
  };

  const elegirOpcion = (indice: number) => {
    setOpcionActiva(indice);
    setOrigenMensaje(null);
    setErrorFormulario("");

    // Cerramos el formulario al salir del listado.
    if (indice !== 2) {
      setIdRequisicion(null);
      setFechaLimite("");
    }

    try {
      sessionStorage.setItem(
        CLAVE_PESTANA,
        String(indice)
      );
    } catch (error) {
      console.error(
        "No se pudo guardar la pestaña activa:",
        error
      );
    }
  };

  const abrirGeneracion = (id: number) => {
    setIdRequisicion(id);
    setFechaLimite("");
    setErrorFormulario("");
    setOrigenMensaje(null);
  };

  const cerrarGeneracion = () => {
    setIdRequisicion(null);
    setFechaLimite("");
    setErrorFormulario("");
  };

  const generarSolicitud = () => {
    if (idRequisicion === null || !puedeGenerar) {
      setErrorFormulario(
        "La requisición no está disponible para generar una cotización."
      );
      return;
    }

    if (!fechaLimite || fechaLimite < fechaHoy()) {
      setErrorFormulario(
        "Selecciona una fecha límite válida."
      );
      return;
    }

    setErrorFormulario("");
    setOrigenMensaje(2);
    setRequisicionEnProceso(idRequisicion);

    dispatch({
      tipo: "generar",
      requisicion: idRequisicion,
      fechaLimite,
      hoy: fechaHoy(),
    });
  };

  const asociarProveedores = (
    idSolicitud: number,
    idsProveedores: number[]
  ) => {
    const proveedores: ProveedorReferencia[] =
      proveedoresIniciales
        .filter((proveedor) =>
          idsProveedores.includes(
            proveedor.idProveedor
          )
        )
        .map((proveedor) => ({
          idProveedor: proveedor.idProveedor,
          razonSocial: proveedor.razonSocial,
          nitRuc: proveedor.nitRuc,
          estado: proveedor.estado,
        }));

    setOrigenMensaje(3);

    dispatch({
      tipo: "enviar",
      id: idSolicitud,
      proveedores,
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
          setMenuAbierto((abierto) => !abierto)
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

        {mostrarMensaje && (
          <p
            role={esErrorMensaje ? "alert" : "status"}
            className={
              esErrorMensaje
                ? "requisiciones-error"
                : "requisiciones-exito"
            }
          >
            {esErrorMensaje ? (
              <AlertCircle size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}
            {mensaje}
          </p>
        )}

        {opcionActiva === 0 && (
          <div className="requisiciones-tarjeta">
            <FormularioRequisicion
              onGuardar={guardar}
            />
          </div>
        )}

        {opcionActiva === 1 && (
          <ValidarRequisicion
            requisiciones={requisiciones}
            onValidar={aprobarRequisicion}
            onAnular={anularRequisicion}
          />
        )}

        {opcionActiva === 2 && (
          <>
            <div className="requisiciones-tarjeta">
              <ListaRequisiciones
                requisiciones={requisiciones}
                solicitudes={solicitudes}
                onGenerarCotizacion={abrirGeneracion}
              />
            </div>

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
                      onChange={(e) => {
                        setFechaLimite(e.target.value);
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
              requisiciones={requisiciones}
              solicitudes={solicitudes}
              solicitudInicialId={solicitudActiva}
              onAsociar={asociarProveedores}
            />
          </div>
        )}
      </section>
    </div>
  );
};

export default Requisiciones;
