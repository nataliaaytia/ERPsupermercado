import { useCallback, useState } from "react";

import FormularioRequisicion from "./FormularioRequisicion";
import EditarRequisicion from "./editarRequisicion";
import MenuLateral from "./MenuLateral";
import ListaRequisiciones from "./ListaRequisiciones";
import ValidarRequisicion from "./ValidarRequisicion";
import SelectorProveedores from "./SelectorProveedores";
import ConsolidarRequisiciones from "./ConsolidarRequisiciones";
import ConsultarRequisicion from "./ConsultarRequisicion";
import Notificacion from "./Notificacion";
import AlertasInventario from "./AlertasInventario";

import { useRequisiciones } from "./useRequisiciones";

import { proveedoresIniciales } from "../catalogo/datosProveedores";

import "./Requisiciones.css";

const opciones = [
  "Nueva requisición",
  "Aprobar o anular requisición",
  "Requisiciones registradas",
  "Solicitudes y ofertas",
  "Consolidar requisiciones",
  "Estado e historial",
  "Alertas de Inventarios",
];

const CLAVE_PESTANA = "requisiciones-pestana";

const cargarPestana = (): number => {
  try {
    const guardada = sessionStorage.getItem(CLAVE_PESTANA);

    if (guardada === null) return 0;

    const indice = Number(guardada);

    return Number.isInteger(indice) && indice >= 0 && indice < opciones.length
      ? indice
      : 0;
  } catch {
    return 0;
  }
};

export const Requisiciones = () => {
  const compras = useRequisiciones();
  const { dispatch } = compras;

  const [opcionActiva, setOpcionActiva] = useState(cargarPestana);

  const [menuAbierto, setMenuAbierto] = useState(true);

  const [idEdicion, setIdEdicion] = useState<number | null>(null);

  const cerrarNotificacion = useCallback(() => {
    dispatch({ tipo: "limpiarMensaje" });
  }, [dispatch]);

  const requisicionEnEdicion = compras.requisiciones.find(
    (requisicion) => requisicion.idRequisicion === idEdicion,
  );

  const elegirOpcion = (indice: number) => {
    cerrarNotificacion();

    setOpcionActiva(indice);
    setIdEdicion(null);

    try {
      sessionStorage.setItem(CLAVE_PESTANA, String(indice));
    } catch {
      // La navegación sigue funcionando sin sessionStorage.
    }
  };

  return (
    <div className="requisiciones-container">
      <MenuLateral
        opciones={opciones}
        opcionActiva={opcionActiva}
        abierto={menuAbierto}
        onAbrirCerrar={() => setMenuAbierto((actual) => !actual)}
        onElegir={elegirOpcion}
      />

      <section className="requisiciones-contenido">
        <header className="requisiciones-header">
          <p className="requisiciones-subtitulo">Compras</p>

          <h1 className="requisiciones-titulo">{opciones[opcionActiva]}</h1>
        </header>

        {compras.mensaje && (
          <Notificacion
            mensaje={compras.mensaje}
            tipo={compras.tipoMensaje}
            onCerrar={cerrarNotificacion}
          />
        )}

        {opcionActiva === 0 && (
          <div className="requisiciones-tarjeta">
            <FormularioRequisicion onGuardar={compras.registrarRequisicion} />
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
                onEditar={(id) => {
                  cerrarNotificacion();
                  setIdEdicion(id);
                }}
                onCambiarPrioridad={(id, prioridad) =>
                  dispatch({
                    tipo: "cambiarPrioridad",
                    id,
                    prioridad,
                  })
                }
                onCancelar={(id) =>
                  dispatch({
                    tipo: "cancelarRequisicion",
                    id,
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
                    requisicionEnEdicion.estado !== "Pendiente" ||
                    compras.solicitudes.some(
                      (solicitud) =>
                        solicitud.requisicion ===
                        requisicionEnEdicion.idRequisicion,
                    )
                  }
                  onGuardar={(datos) =>
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
          </>
        )}

        {opcionActiva === 3 && (
          <div className="requisiciones-tarjeta">
            <SelectorProveedores
              proveedores={proveedoresIniciales}
              estado={compras}
              dispatch={dispatch}
              solicitudInicialId={null}
            />
          </div>
        )}

        {opcionActiva === 4 && (
          <div className="requisiciones-tarjeta">
            <ConsolidarRequisiciones estado={compras} dispatch={dispatch} />
          </div>
        )}

        {opcionActiva === 5 && (
          <div className="requisiciones-tarjeta">
            <ConsultarRequisicion
              requisiciones={compras.requisiciones}
              solicitudes={compras.solicitudes}
            />
          </div>
        )}
        {opcionActiva === 6 && (
          <div className="requisiciones-tarjeta">
            <AlertasInventario
              alertasInventario={compras.alertasInventario}
              historialProcesamientos={compras.historialProcesamientos}
              dispatch={dispatch}
            />
          </div>
        )}
      </section>
    </div>
  );
};

export default Requisiciones;
