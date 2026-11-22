import type { ReactNode } from 'react';
import SiguientePaso from '../../componentes/ui/SiguientePaso';
import { useSesion } from '../../contexto/SesionContext';
import { useCompras } from '../../estado/useCompras';
import { formatearFechaHora } from '../../utilidades/fechas';
import DevolucionesRecepcion from './paginas/DevolucionesRecepcion';
import DisponibilidadDespacho from './paginas/DisponibilidadDespacho';
import FormularioDiscrepancia from './paginas/FormularioDiscrepancia';
import HistorialRecepciones from './paginas/HistorialRecepciones';
import RegistrarRecepcion from './paginas/RegistrarRecepcion';
import RevisionFinalRecepcion from './paginas/RevisionFinalRecepcion';
import { etiquetaTipoDiferencia } from './servicios/recepcionApi';
import { registrarDiscrepancia } from './servicios/servicioDiscrepancias';
import { registrarInspeccionCalidad } from './servicios/servicioInspeccionCalidad';
import { confirmarRecepcion } from './servicios/validarRecepcion';
import '../ordenesCompra/ordenesCompra.css';
import './recepcion.css';

const RUTA = '/recepcion';

/** Contenedor con las clases de estilo propias del módulo. */
function Contenedor({ children }: { children: ReactNode }) {
  return <div className="ordenes-compra recepcion-control">{children}</div>;
}

export function PaginaRegistrar() {
  const { recepcionesRegistradas } = useCompras();
  return (
    <Contenedor>
      <RegistrarRecepcion />
      {recepcionesRegistradas.length > 0 && (
        <SiguientePaso
          texto="Cada entrega registrada queda pendiente de inspección de calidad."
          a={`${RUTA}/recepciones`}
          etiqueta="Inspeccionar recepciones"
        />
      )}
    </Contenedor>
  );
}

export function PaginaRecepciones() {
  const compras = useCompras();
  const hayPendientes = compras.recepcionesRegistradas.some(
    (recepcion) => !compras.recepcionesValidadas.some((validada) => validada.idRecepcion === recepcion.idRecepcion),
  );

  return (
    <Contenedor>
      <HistorialRecepciones
        ordenes={compras.ordenes}
        ofertas={compras.ofertas}
        recepciones={compras.recepcionesRegistradas}
        validadas={compras.recepcionesValidadas}
        inspecciones={compras.inspeccionesCalidad}
        onRegistrarInspeccion={registrarInspeccionCalidad}
      />
      {hayPendientes && (
        <SiguientePaso
          texto="Después de inspeccionar, confirma las cantidades aceptadas en la revisión final."
          a={`${RUTA}/revision-final`}
          etiqueta="Revisión final"
        />
      )}
    </Contenedor>
  );
}

export function PaginaDiscrepancias() {
  const { recepcionesRegistradas, ordenes, discrepancias } = useCompras();
  return (
    <Contenedor>
      <FormularioDiscrepancia recepciones={recepcionesRegistradas} ordenes={ordenes} onSubmit={registrarDiscrepancia} />

      <section className="tarjeta">
        <h2>Discrepancias registradas</h2>
        {discrepancias.length === 0 ? (
          <p className="estado-vacio">Todavía no se registraron discrepancias.</p>
        ) : (
          <div className="tabla-contenedor">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Orden</th>
                  <th>Recepción</th>
                  <th>Línea</th>
                  <th>Tipo</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {discrepancias.map((discrepancia) => (
                  <tr key={discrepancia.idDiscrepancia}>
                    <td>{formatearFechaHora(discrepancia.fechaRegistro)}</td>
                    <td>{ordenes.find((orden) => orden.idOrden === discrepancia.idOrden)?.numero}</td>
                    <td>
                      {recepcionesRegistradas.find((r) => r.idRecepcion === discrepancia.idRecepcion)?.documento}
                    </td>
                    <td>{discrepancia.idDetalleOrden}</td>
                    <td>
                      <span className="etiqueta etiqueta--advertencia">
                        {discrepancia.tipoDiferencia
                          ? etiquetaTipoDiferencia(discrepancia.tipoDiferencia)
                          : discrepancia.tipo === 'cantidad'
                            ? 'Cantidad'
                            : 'Producto'}
                      </span>
                    </td>
                    <td>
                      {discrepancia.tipo === 'cantidad'
                        ? `${discrepancia.cantidadDiscrepante} unidades. `
                        : `Se recibió: ${discrepancia.productoRecibido}. `}
                      {discrepancia.descripcion}
                      {discrepancia.estado === 'PENDIENTE_RESOLUCION' && ' (pendiente de resolución)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Contenedor>
  );
}

export function PaginaRevisionFinal() {
  const compras = useCompras();
  const { usuario } = useSesion();
  return (
    <Contenedor>
      <RevisionFinalRecepcion
        recepciones={compras.recepcionesRegistradas}
        ordenes={compras.ordenes}
        recepcionesValidadas={compras.recepcionesValidadas}
        inspecciones={compras.inspeccionesCalidad}
        onConfirmar={confirmarRecepcion}
        usuarioAutorizador={usuario?.nombre ?? usuario?.usuario}
      />
      {compras.recepcionesValidadas.length > 0 && (
        <SiguientePaso
          texto="Con la recepción validada ya se puede registrar y validar la factura del proveedor (3-way matching)."
          a="/facturacion/registrar"
          etiqueta="Registrar factura"
        />
      )}
    </Contenedor>
  );
}

export function PaginaDevoluciones() {
  return (
    <Contenedor>
      <DevolucionesRecepcion />
    </Contenedor>
  );
}

export function PaginaDespacho() {
  return (
    <Contenedor>
      <DisponibilidadDespacho />
    </Contenedor>
  );
}

