import { ChevronLeft, ChevronRight } from "lucide-react";
import "./MenuLateral.css";

interface Props {
  opciones: string[];
  opcionActiva: number;
  abierto: boolean;
  onAbrirCerrar: () => void;
  onElegir: (indice: number) => void;
}

export const MenuLateral = ({
  opciones,
  opcionActiva,
  abierto,
  onAbrirCerrar,
  onElegir,
}: Props) => (
  <aside className={`menu-lateral ${abierto ? "" : "menu-lateral--cerrado"}`}>
    <nav
      className="menu-lateral__opciones"
      aria-label="Secciones de requisiciones"
      hidden={!abierto}
    >
      <span className="menu-lateral__titulo">Requisiciones</span>
      {opciones.map((opcion, indice) => (
        <button
          type="button"
          key={opcion}
          className="menu-lateral__opcion"
          aria-current={opcionActiva === indice ? "page" : undefined}
          onClick={() => onElegir(indice)}
        >
          {opcion}
        </button>
      ))}
    </nav>
    <button
      type="button"
      className="menu-lateral__boton"
      onClick={onAbrirCerrar}
      aria-expanded={abierto}
      aria-label={abierto ? "Ocultar menú" : "Mostrar menú"}
    >
      {abierto ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
    </button>
  </aside>
);

export default MenuLateral;
