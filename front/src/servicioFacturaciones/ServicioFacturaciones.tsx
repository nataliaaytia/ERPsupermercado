
import { useEffect, useState } from "react";

import MenuLateral from "../requisicionesCotizaciones/MenuLateral";

import "../requisicionesCotizaciones/Requisiciones.css";
import "./ServicioFacturaciones.css";

const opciones = [
  "Registrar factura",
];

const CLAVE_ESTADO_MENU = "facturacion-menu-abierto";

function obtenerEstadoInicialMenu(): boolean {
  const estadoPredeterminado =
    !window.matchMedia("(max-width: 800px)").matches;

  try {
    const estadoGuardado = sessionStorage.getItem(
      CLAVE_ESTADO_MENU
    );

    if (estadoGuardado === "true") return true;
    if (estadoGuardado === "false") return false;
  } catch {
    return estadoPredeterminado;
  }

  return estadoPredeterminado;
}

export default function ServicioFacturaciones() {
  const [opcionActiva, setOpcionActiva] = useState(0);

  const [menuAbierto, setMenuAbierto] = useState(
    obtenerEstadoInicialMenu
  );

  useEffect(() => {
    try {
      sessionStorage.setItem(
        CLAVE_ESTADO_MENU,
        String(menuAbierto)
      );
    } catch {
      return;
    }
  }, [menuAbierto]);

  const alternarMenu = () => {
    setMenuAbierto((estadoAnterior) => !estadoAnterior);
  };

  return (
    <div className="requisiciones-container facturaciones">
      <MenuLateral
        titulo="Facturación"
        opciones={opciones}
        opcionActiva={opcionActiva}
        abierto={menuAbierto}
        onAbrirCerrar={alternarMenu}
        onElegir={setOpcionActiva}
      />

      <section className="requisiciones-contenido">
        <header className="requisiciones-header">
          <p className="requisiciones-subtitulo">
            Facturación
          </p>

          <h1 className="requisiciones-titulo">
            {opciones[opcionActiva]}
          </h1>
        </header>

        <div className="requisiciones-tarjeta">
          <p>
            Formulario de registro de facturas
            pendiente de implementación.
          </p>
        </div>
      </section>
    </div>
  );
}
