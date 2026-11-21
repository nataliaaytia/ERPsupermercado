import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SiguientePaso from '../../componentes/ui/SiguientePaso';
import { obtenerCompras } from '../../estado/almacenCompras';
import { productosDelCatalogo, useCompras } from '../../estado/useCompras';
import EditarRequisicion from './componentes/EditarRequisicion';
import AlertasInventario from './paginas/AlertasInventario';
import ConsolidarRequisiciones from './paginas/ConsolidarRequisiciones';
import ConsultarRequisicion from './paginas/ConsultarRequisicion';
import FormularioRequisicion from './paginas/FormularioRequisicion';
import ListaRequisiciones from './paginas/ListaRequisiciones';
import SelectorProveedores from './paginas/SelectorProveedores';
import ValidarRequisicion from './paginas/ValidarRequisicion';
import type { DatosRequisicion, ProveedorReferencia } from './tipos';

const RUTA = '/requisiciones';

export function PaginaAlertas() {
  const compras = useCompras();
  return (
    <>
      <div className="tarjeta">
        <AlertasInventario
          alertasPendientes={compras.alertasPendientes}
          alertasInventario={compras.alertasInventario}
          historialProcesamientos={compras.historialProcesamientos}
          dispatch={compras.dispatch}
        />
      </div>
      {compras.alertasInventario.length > 0 && (
        <SiguientePaso
          texto="Las alertas procesadas generaron requisiciones pendientes. Revísalas y apruébalas."
          a={`${RUTA}/aprobacion`}
          etiqueta="Aprobar requisiciones"
        />
      )}
    </>
  );
}

export function PaginaNueva() {
  const { proveedores, registrarRequisicion } = useCompras();
  const navegar = useNavigate();

  const guardar = (datos: DatosRequisicion) => {
    const antes = obtenerCompras().requisiciones.length;
    registrarRequisicion(datos);
    // Si el registro fue exitoso, se continúa con la aprobación.
    if (obtenerCompras().requisiciones.length > antes) navegar(`${RUTA}/aprobacion`);
  };

  return (
    <div className="tarjeta">
      <FormularioRequisicion
        onGuardar={guardar}
        sugerencias={productosDelCatalogo(proveedores).map((producto) => producto.descripcion)}
      />
    </div>
  );
}

export function PaginaAprobacion() {
  const { requisiciones, validar, anular } = useCompras();
  const pendientes = requisiciones.filter((requisicion) => requisicion.estado === 'Pendiente');
  const hayAprobadas = requisiciones.some((requisicion) => requisicion.estado === 'Aprobada');

  return (
    <>
      <ValidarRequisicion requisiciones={pendientes} onValidar={validar} onAnular={anular} />
      {hayAprobadas && (
        <SiguientePaso
          texto="Con las requisiciones aprobadas puedes generar solicitudes de cotización (o consolidarlas primero)."
          a={`${RUTA}/cotizaciones`}
          etiqueta="Solicitar cotizaciones"
        />
      )}
    </>
  );
}

export function PaginaRegistradas() {
  const compras = useCompras();
  const { dispatch } = compras;
  const [idEdicion, setIdEdicion] = useState<number | null>(null);

  const enEdicion = compras.requisiciones.find((requisicion) => requisicion.idRequisicion === idEdicion);
  const bloqueada =
    !!enEdicion &&
    (enEdicion.estado !== 'Pendiente' ||
      compras.solicitudes.some((solicitud) => solicitud.requisicion === enEdicion.idRequisicion));

  return (
    <>
      <div className="tarjeta">
        <ListaRequisiciones
          requisiciones={compras.requisiciones}
          solicitudes={compras.solicitudes}
          idEnEdicion={idEdicion}
          onEditar={setIdEdicion}
          onCambiarPrioridad={(id, prioridad) => dispatch({ tipo: 'cambiarPrioridad', id, prioridad })}
          onCancelar={(id) => dispatch({ tipo: 'cancelarRequisicion', id })}
        />
      </div>

      {enEdicion && (
        <div className="tarjeta">
          <EditarRequisicion
            key={enEdicion.idRequisicion}
            requisicion={enEdicion}
            bloqueada={bloqueada}
            onGuardar={(datos) => dispatch({ tipo: 'modificar', id: enEdicion.idRequisicion, datos })}
            onCancelar={() => setIdEdicion(null)}
          />
        </div>
      )}
    </>
  );
}

export function PaginaConsolidar() {
  const compras = useCompras();
  return (
    <>
      <div className="tarjeta">
        <ConsolidarRequisiciones estado={compras} dispatch={compras.dispatch} />
      </div>
      <SiguientePaso
        texto="La consolidación genera una solicitud de cotización. Asocia proveedores y registra sus ofertas."
        a={`${RUTA}/cotizaciones`}
        etiqueta="Ir a cotizaciones"
      />
    </>
  );
}

export function PaginaCotizaciones() {
  const compras = useCompras();
  const [parametros] = useSearchParams();
  const idSolicitud = Number(parametros.get('solicitud'));

  const proveedores: ProveedorReferencia[] = compras.proveedores.map((proveedor) => ({
    idProveedor: proveedor.idProveedor,
    razonSocial: proveedor.razonSocial,
    nitRuc: proveedor.nitRuc,
    estado: proveedor.estado,
  }));

  return (
    <div className="tarjeta">
      <SelectorProveedores
        proveedores={proveedores}
        estado={compras}
        dispatch={compras.dispatch}
        solicitudInicialId={Number.isInteger(idSolicitud) && idSolicitud > 0 ? idSolicitud : null}
      />
    </div>
  );
}

export function PaginaHistorial() {
  const { requisiciones, solicitudes } = useCompras();
  return (
    <div className="tarjeta">
      <ConsultarRequisicion requisiciones={requisiciones} solicitudes={solicitudes} />
    </div>
  );
}

