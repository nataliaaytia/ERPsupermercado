import type { ReactNode } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import SiguientePaso from '../../componentes/ui/SiguientePaso';
import { useCompras } from '../../estado/useCompras';
import BandejaDemoras from './paginas/BandejaDemoras';
import BuscarOrdenesCompra from './paginas/BuscarOrdenesCompra';
import CompromisosEntregaOrden from './paginas/CompromisosEntregaOrden';
import CondicionesLogisticasOrden from './paginas/CondicionesLogisticasOrden';
import DetalleOrdenCompra from './paginas/DetalleOrdenCompra';
import GenerarOrdenCompra from './paginas/GenerarOrdenCompra';
import GestionOrdenesBorrador from './paginas/GestionOrdenesBorrador';
import SeguimientoEntregas from './paginas/SeguimientoEntregas';
import { guardarOrdenesCompra } from './servicios/compromisosEntrega';
import './ordenesCompra.css';

const RUTA = '/ordenes-compra';

/** Contenedor con las clases de estilo propias del módulo. */
function Contenedor({ children }: { children: ReactNode }) {
  return <div className="ordenes-compra">{children}</div>;
}

function useIrADetalle() {
  const navegar = useNavigate();
  return (idOrden: number) => navegar(`${RUTA}/detalle/${idOrden}`);
}

export function PaginaNueva() {
  const navegar = useNavigate();
  return (
    <Contenedor>
      <GenerarOrdenCompra onOrdenCreada={(orden) => navegar(`${RUTA}/borradores?orden=${orden.idOrden}`)} />
    </Contenedor>
  );
}

export function PaginaBorradores() {
  const [parametros] = useSearchParams();
  const { ordenes } = useCompras();
  const idOrden = Number(parametros.get('orden')) || null;
  const pendientes = ordenes.some((orden) => orden.estado === 'Pendiente de aprobación');

  return (
    <Contenedor>
      <GestionOrdenesBorrador idOrdenInicial={idOrden} />
      {pendientes && (
        <SiguientePaso
          texto="Hay órdenes esperando la aprobación del Jefe de Compras."
          a={`${RUTA}/aprobacion`}
          etiqueta="Ver órdenes por aprobar"
        />
      )}
    </Contenedor>
  );
}

export function PaginaAprobacion() {
  const irADetalle = useIrADetalle();
  return (
    <Contenedor>
      <BuscarOrdenesCompra onVerDetalle={irADetalle} estadoInicial="Pendiente de aprobación" />
    </Contenedor>
  );
}

export function PaginaBuscar() {
  const irADetalle = useIrADetalle();
  return (
    <Contenedor>
      <BuscarOrdenesCompra onVerDetalle={irADetalle} />
    </Contenedor>
  );
}

/** Indica qué hacer con la orden según su estado actual. */
function pasoSegunEstado(estado: string, idOrden: number): ReactNode {
  switch (estado) {
    case 'Borrador':
      return (
        <SiguientePaso
          texto="La orden está en borrador. Revísala y solicita su aprobación."
          a={`${RUTA}/borradores?orden=${idOrden}`}
          etiqueta="Editar borrador"
        />
      );
    case 'Confirmada':
      return (
        <SiguientePaso
          texto="El proveedor confirmó la orden. Cuando llegue la mercadería, regístrala en Recepción."
          a="/recepcion/registrar"
          etiqueta="Registrar recepción"
        />
      );
    default:
      return null;
  }
}

export function PaginaDetalle() {
  const { id } = useParams();
  const { ordenes } = useCompras();
  const idOrden = Number(id) || null;
  const orden = ordenes.find((item) => item.idOrden === idOrden);

  return (
    <Contenedor>
      <DetalleOrdenCompra key={idOrden ?? 'sin-orden'} idOrdenInicial={idOrden} />
      {orden && pasoSegunEstado(orden.estado, orden.idOrden)}
    </Contenedor>
  );
}

export function PaginaCompromisos() {
  const { ordenes } = useCompras();
  return (
    <Contenedor>
      <CompromisosEntregaOrden ordenes={ordenes} />
    </Contenedor>
  );
}

export function PaginaLogistica() {
  const { ordenes } = useCompras();
  return (
    <Contenedor>
      <CondicionesLogisticasOrden ordenes={ordenes} onGuardar={guardarOrdenesCompra} />
    </Contenedor>
  );
}

export function PaginaSeguimiento() {
  return (
    <Contenedor>
      <SeguimientoEntregas />
    </Contenedor>
  );
}

export function PaginaDemoras() {
  const navegar = useNavigate();
  return (
    <Contenedor>
      <BandejaDemoras onVerCompromiso={() => navegar(`${RUTA}/compromisos`)} />
    </Contenedor>
  );
}

