import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import FormularioRequisicion from "./FormularioRequisicion";
import { useRequisiciones } from "./useRequisiciones";
import type { DatosRequisicion, Requisicion } from "./tipos";
import "./Requisiciones.css";
import MenuLateral from "./MenuLateral";
import ListaRequisiciones from "./ListaRequisiciones";

const opciones = ["Nueva requisición", "Requisiciones registradas"];

export const Requisiciones = () => {
  const { requisiciones, registrarRequisicion } = useRequisiciones();
  const [opcionActiva, setOpcionActiva] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState(true);
  const [ultima, setUltima] = useState<Requisicion | null>(null);

  const guardar = (datos: DatosRequisicion) => {
    setUltima(registrarRequisicion(datos));
  };

  const elegirOpcion = (indice: number) => {
    setOpcionActiva(indice);
    setUltima(null);
  };

  return (
    <div className="requisiciones-container">
      <MenuLateral
        opciones={opciones}
        opcionActiva={opcionActiva}
        abierto={menuAbierto}
        onAbrirCerrar={() => setMenuAbierto((abierto) => !abierto)}
        onElegir={elegirOpcion}
      />
      <section className="requisiciones-contenido">
        <header className="requisiciones-header">
          <p className="requisiciones-subtitulo">Compras</p>
          <h1 className="requisiciones-titulo">{opciones[opcionActiva]}</h1>
        </header>

        {opcionActiva === 0 && (
          <>
            {ultima && (
              <p role="status" className="requisiciones-exito">
                <CheckCircle2 size={18} />
                Requisición {ultima.id} registrada con estado {ultima.estado}.
              </p>
            )}
            <div className="requisiciones-tarjeta">
              <FormularioRequisicion onGuardar={guardar} />
            </div>
          </>
        )}

        {opcionActiva === 1 && (
          <div className="requisiciones-tarjeta">
            <ListaRequisiciones requisiciones={requisiciones} />
          </div>
        )}
      </section>
    </div>
  );
};

export default Requisiciones;
