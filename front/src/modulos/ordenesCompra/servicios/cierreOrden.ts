import { actualizarCompras, obtenerCompras } from '../../../estado/almacenCompras';
import { fechaHoy } from '../../../utilidades/fechas';
import type { DatosCierreOrden, ServicioCierreOrden } from '../componentes/CierreOrden';
import { calcularSaldosEntrega } from './utilidadesSeguimientoEntregas';

const RESPONSABLE_CIERRE = 'Jefe de compras';

/** Motivos por los que una orden todavía no puede cerrarse. */
function motivosBloqueo(idOrden: number): string[] {
  const compras = obtenerCompras();
  const orden = compras.ordenes.find((item) => item.idOrden === idOrden);
  if (!orden) return ['La orden de compra no existe.'];
  if (orden.estado !== 'Confirmada') return [`Solo se cierran órdenes confirmadas (estado actual: ${orden.estado}).`];

  const validadas = compras.recepcionesValidadas.filter((item) => item.idOrden === idOrden);
  const pendientes = calcularSaldosEntrega(orden, validadas)
    .filter((linea) => linea.pendientes > 0)
    .map((linea) => `Línea ${linea.idDetalle} · ${linea.producto}: faltan ${linea.pendientes} unidades.`);

  const recepcionesSinValidar = compras.recepcionesRegistradas.filter(
    (recepcion) =>
      recepcion.idOrden === idOrden &&
      !validadas.some((validada) => validada.idRecepcion === recepcion.idRecepcion),
  );

  return [
    ...pendientes,
    ...(recepcionesSinValidar.length
      ? [`Hay ${recepcionesSinValidar.length} recepción(es) sin revisión final.`]
      : []),
  ];
}

/** Servicio local de cierre de órdenes (se reemplazará por el endpoint del backend). */
export const servicioCierreOrden: ServicioCierreOrden = {
  verificar: async (idOrden) => motivosBloqueo(idOrden),

  cerrar: async (idOrden) => {
    const motivos = motivosBloqueo(idOrden);
    if (motivos.length) return { ok: false, motivos };

    const cierre: DatosCierreOrden = { fechaCierre: fechaHoy(), responsable: RESPONSABLE_CIERRE };

    actualizarCompras((actual) => ({
      ...actual,
      ordenes: actual.ordenes.map((orden) =>
        orden.idOrden === idOrden
          ? {
              ...orden,
              estado: 'Cerrada',
              historialEstados: [
                ...(orden.historialEstados ?? []),
                {
                  estadoAnterior: orden.estado,
                  estadoNuevo: 'Cerrada',
                  usuario: RESPONSABLE_CIERRE,
                  fecha: new Date().toISOString(),
                  observacion: 'Todas las cantidades fueron recibidas y aceptadas.',
                },
              ],
            }
          : orden,
      ),
      mensaje: `La orden ${actual.ordenes.find((o) => o.idOrden === idOrden)?.numero ?? ''} fue cerrada.`,
      tipoMensaje: 'exito',
    }));

    return { ok: true, cierre };
  },
};
