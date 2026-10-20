import { useState } from "react";

import FormularioRequisicion from "./FormularioRequisicion";
import MenuLateral from "./MenuLateral";
import ListaRequisiciones from "./ListaRequisiciones";
import ValidarRequisicion from "./ValidarRequisicion";
import SelectorProveedores from "./SelectorProveedores";

import { useRequisiciones } from "./useRequisiciones";
import { proveedoresIniciales } from "../catalogo/datosProveedores";

import "./Requisiciones.css";

const opciones = [
  "Nueva requisición",
  "Requisiciones registradas",
  "Aprobar o anular requisición",
  "Solicitudes y ofertas",
];

const CLAVE_PESTANA = "requisiciones-pestana";

const cargarPestana = () => {
  try {
    const n = Number(
      sessionStorage.getItem(CLAVE_PESTANA),
    );

    return (
      Number.isInteger(n) &&
      n >= 0 &&
      n < opciones.length
    )
      ? n
      : 0;
  } catch {
    return 0;
  }
};

export const Requisiciones = () => {
  const compras = useRequisiciones();

  const [opcionActiva, setOpcionActiva] =
    useState(cargarPestana);

  const [menuAbierto, setMenuAbierto] =
    useState(true);

  const elegirOpcion = (indice: number) => {
    compras.dispatch({ tipo: "limpiarMensaje" });
    setOpcionActiva(indice);

    try {
      sessionStorage.setItem(
        CLAVE_PESTANA,
        String(indice),
      );
    } catch {
    }
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
          <p role="status">
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
          <div className="requisiciones-tarjeta">
            <ListaRequisiciones
              requisiciones={compras.requisiciones}
            />
          </div>
        )}

        {opcionActiva === 2 && (
          <ValidarRequisicion
            requisiciones={compras.requisiciones}
            onValidar={compras.validar}
            onAnular={compras.anular}
          />
        )}

        {opcionActiva === 3 && (
          <div className="requisiciones-tarjeta">
            <SelectorProveedores
              proveedores={proveedoresIniciales}
              estado={compras}
              dispatch={compras.dispatch}
            />
          </div>
        )}
      </section>
    </div>
  );
};

export default Requisiciones;