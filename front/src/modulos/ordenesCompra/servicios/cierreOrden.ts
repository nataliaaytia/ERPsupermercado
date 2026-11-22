import { actualizarCompras, obtenerCompras } from '../../../estado/almacenCompras';
import { fechaHoy } from '../../../utilidades/fechas';
import type { DatosCierreOrden, ServicioCierreOrden } from '../componentes/CierreOrden';
import { calcularSaldosEntrega } from './utilidadesSeguimientoEntregas';
import { ErrorApi } from '../../../servicios/api/clienteHttp';
import { conexion } from '../../../servicios/api/configuracion';
import * as api from './ordenesApi';
import { finalizarOperacion } from './operacionApi';

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

/** Separa los motivos que devuelve Recepción ("No se puede cerrar la orden: a; b"). */
function motivosDelServidor(mensaje: string): string[] {
  const [encabezado, ...resto] = mensaje.split(': ');
  const detalle = resto.join(': ');
  if (!detalle) return [mensaje];
  return [
    `${encabezado}.`,
    ...detalle
      .split('; ')
      .map((motivo) => `${motivo.replace(/^Producto (\d+)/, (_, id: string) => api.nombreProducto(Number(id)))}.`),
  ];
}

/** Cierre en el servidor: Recepción valida saldos y devoluciones y luego cierra la orden. */
const servicioCierreServidor: ServicioCierreOrden = {
  verificar: async (idOrden) => {
    const orden = obtenerCompras().ordenes.find((item) => item.idOrden === idOrden);
    if (!orden) return ['La orden de compra no existe.'];
    if (orden.estado !== 'Confirmada') return [`Solo se cierran órdenes confirmadas (estado actual: ${orden.estado}).`];
    return [];
  },

  cerrar: async (idOrden) => {
    const sesion = api.usuarioActual();
    try {
      const resultado = await api.cerrar(idOrden, sesion.nombre || sesion.usuario || RESPONSABLE_CIERRE);
      await finalizarOperacion(`La orden ${resultado?.numero ?? ''} fue cerrada.`.replace('  ', ' '));
      return {
        ok: true,
        cierre: {
          fechaCierre: String(resultado?.fechaCierre ?? fechaHoy()).slice(0, 10),
          responsable: resultado?.responsable ?? RESPONSABLE_CIERRE,
        },
      };
    } catch (fallo) {
      if (fallo instanceof ErrorApi) {
        return { ok: false, motivos: motivosDelServidor(fallo.message) };
      }
      throw fallo;
    }
  },
};

/** Servicio local de cierre de órdenes (datos de prueba). */
const servicioCierreLocal: ServicioCierreOrden = {
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

/** Servicio de cierre que usa la pantalla de seguimiento. */
export const servicioCierreOrden: ServicioCierreOrden = conexion.ordenes ? servicioCierreServidor : servicioCierreLocal;
