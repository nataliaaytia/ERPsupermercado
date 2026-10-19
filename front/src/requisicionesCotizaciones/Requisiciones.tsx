
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import FormularioRequisicion from "./FormularioRequisicion";
import MenuLateral from "./MenuLateral";
import ListaRequisiciones from "./ListaRequisiciones";
import ValidarRequisicion from "./ValidarRequisicion";
import SelectorProveedores from "./SelectorProveedores";

import { useRequisiciones } from "./useRequisiciones";
import { proveedoresIniciales } from "../catalogo/datosProveedores";
import type { DatosRequisicion, Requisicion } from "./tipos";

import "./Requisiciones.css";

const opciones = [
  "Nueva requisición",
  "Requisiciones registradas",
  "Validar requisición",
  "Seleccionar proveedores",
];

const CLAVE_ASOCIACIONES = "erp-asociaciones-proveedores";
const CLAVE_PESTANA = "requisiciones-pestana";

// Recuperar asociaciones guardadas
const cargarAsociaciones = (): Record<string, number[]> => {
  try {
    const guardadas = localStorage.getItem(CLAVE_ASOCIACIONES);

    if (!guardadas) return {};

    const datos: unknown = JSON.parse(guardadas);

    if (
      typeof datos !== "object" ||
      datos === null ||
      Array.isArray(datos)
    ) {
      return {};
    }

    const asociacionesValidas: Record<string, number[]> = {};

    for (const [cotizacionId, ids] of Object.entries(datos)) {
      if (
        Array.isArray(ids) &&
        ids.every(
          (id) =>
            typeof id === "number" &&
            Number.isInteger(id)
        )
      ) {
        asociacionesValidas[cotizacionId] = ids;
      }
    }

    return asociacionesValidas;
  } catch {
    return {};
  }
};

// Recuperar la última pestaña utilizada
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
  const { requisiciones, registrarRequisicion, validar } =
    useRequisiciones();

  const [opcionActiva, setOpcionActiva] =
    useState<number>(cargarPestana);

  const [menuAbierto, setMenuAbierto] = useState(true);
  const [ultima, setUltima] = useState<Requisicion | null>(null);

  const [asociaciones, setAsociaciones] = useState<
    Record<string, number[]>
  >(cargarAsociaciones);

  // Guardar asociaciones de proveedores
  useEffect(() => {
    try {
      localStorage.setItem(
        CLAVE_ASOCIACIONES,
        JSON.stringify(asociaciones)
      );
    } catch (error) {
      console.error(
        "No se pudieron guardar las asociaciones:",
        error
      );
    }
  }, [asociaciones]);

  // Registrar requisición
  const guardar = (datos: DatosRequisicion) => {
    setUltima(registrarRequisicion(datos));
  };

  // Cambiar y recordar la pestaña seleccionada
  const elegirOpcion = (indice: number) => {
    setOpcionActiva(indice);

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

    setUltima(null);
  };

  // Asociar proveedores a una cotización
  const asociarProveedores = (
    cotizacionId: string,
    proveedoresIds: number[]
  ) => {
    setAsociaciones((actuales) => ({
      ...actuales,
      [cotizacionId]: [...proveedoresIds],
    }));
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

        {opcionActiva === 0 && (
          <>
            {ultima && (
              <p
                role="status"
                className="requisiciones-exito"
              >
                <CheckCircle2 size={18} />
                Requisición {ultima.id} registrada con estado{" "}
                {ultima.estado}.
              </p>
            )}

            <div className="requisiciones-tarjeta">
              <FormularioRequisicion
                onGuardar={guardar}
              />
            </div>
          </>
        )}

        {opcionActiva === 1 && (
          <div className="requisiciones-tarjeta">
            <ListaRequisiciones
              requisiciones={requisiciones}
            />
          </div>
        )}

        {opcionActiva === 2 && (
          <ValidarRequisicion
            requisiciones={requisiciones}
            onValidar={validar}
          />
        )}

        {opcionActiva === 3 && (
          <div className="requisiciones-tarjeta">
            <SelectorProveedores
              proveedores={proveedoresIniciales}
              asociaciones={asociaciones}
              onAsociar={asociarProveedores}
            />
          </div>
        )}
      </section>
    </div>
  );
};

export default Requisiciones;
