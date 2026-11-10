import { useState } from "react";
import MenuLateral from "../requisicionesCotizaciones/MenuLateral";
import { useRequisiciones } from "../requisicionesCotizaciones/useRequisiciones";

import GenerarOrdenCompra from "./GenerarOrdenCompra";
import GestionOrdenesBorrador from "./GestionOrdenesBorrador";
import BuscarOrdenesCompra from "./BuscarOrdenesCompra";
import DetalleOrdenCompra from "./DetalleOrdenCompra";
import CompromisosEntregaOrden from "./CompromisosEntregaOrden";
import CondicionesLogisticasOrden from "./CondicionesLogisticasOrden";
import SeguimientoEntregas from "./SeguimientoEntregas";

import { guardarOrdenesCompra } from "./compromisosEntrega";

import "../requisicionesCotizaciones/Requisiciones.css";
import "./ServicioOrdenesCompra.css";

const opcionesOrdenes = [
  "Crear orden",
  "Editar orden",
  "Buscar órdenes",
  "Detalle de orden",
  "Compromisos de entrega",
  "Condiciones logísticas",
  "Pendientes de entrega",
];

export default function ServicioOrdenesCompra() {
  const { ordenes, errorCarga } = useRequisiciones();

  const [opcionActiva, setOpcionActiva] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState(true);
  const [idOrdenDetalle, setIdOrdenDetalle] = useState<
    number | null
  >(null);

  function abrirDetalle(idOrden: number) {
    setIdOrdenDetalle(idOrden);
    setOpcionActiva(3);
  }

  function elegirOpcion(indice: number) {
    setOpcionActiva(indice);

    if (indice === 3) {
      setIdOrdenDetalle(null);
    }
  }

  return (
    <div className="requisiciones-container">
      <MenuLateral
        titulo="Órdenes de compra"
        opciones={opcionesOrdenes}
        opcionActiva={opcionActiva}
        abierto={menuAbierto}
        onAbrirCerrar={() =>
          setMenuAbierto((actual) => !actual)
        }
        onElegir={elegirOpcion}
      />

      <section className="requisiciones-contenido ordenes-compra">
        <header className="requisiciones-header">
          <p className="requisiciones-subtitulo">
            Órdenes de compra
          </p>

          <h1 className="requisiciones-titulo">
            {opcionesOrdenes[opcionActiva]}
          </h1>
        </header>

        {errorCarga ? (
          <p className="ordenes-compra__error" role="alert">
            {errorCarga}
          </p>
        ) : (
          <>
            {opcionActiva === 0 && (
              <GenerarOrdenCompra />
            )}

            {opcionActiva === 1 && (
              <GestionOrdenesBorrador />
            )}

            {opcionActiva === 2 && (
              <BuscarOrdenesCompra
                onVerDetalle={abrirDetalle}
              />
            )}

            {opcionActiva === 3 && (
              <DetalleOrdenCompra
                idOrdenInicial={idOrdenDetalle}
              />
            )}

            {opcionActiva === 4 && (
              <CompromisosEntregaOrden
                ordenes={ordenes}
              />
            )}

            {opcionActiva === 5 && (
              <CondicionesLogisticasOrden
                ordenes={ordenes}
                onGuardar={guardarOrdenesCompra}
              />
            )}

            {opcionActiva === 6 && (
              <SeguimientoEntregas />
            )}
          </>
        )}
      </section>
    </div>
  );
}
