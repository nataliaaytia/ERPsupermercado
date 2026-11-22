
import {
  actualizarCompras,
  notificarMensaje,
  obtenerCompras,
  type EstadoCompartido,
} from "../../../estado/almacenCompras";
import { conexion } from "../../../servicios/api/configuracion";
import type {
  EstadoRespuestaProveedor,
  OrdenCompra,
  RespuestaProveedor,
} from "../tipos";
import * as api from "./ordenesApi";
import { finalizarOperacion } from "./operacionApi";
import type { EventoOrdenCompraConfirmada } from "../tipos/eventoContabilidad";

/** Proveedor de la orden: el de su oferta de origen o el registrado en el servidor. */
function proveedorDeOrden(
  actual: EstadoCompartido,
  orden: OrdenCompra,
): EventoOrdenCompraConfirmada["proveedor"] | undefined {
  const oferta = actual.ofertas.find(
    (item) => item.idOferta === orden.idOfertaOrigen
  );

  if (oferta?.proveedor) {
    return {
      idProveedor: oferta.proveedor.idProveedor,
      razonSocial: oferta.proveedor.razonSocial,
      nitRuc: oferta.proveedor.nitRuc,
    };
  }

  const proveedor = actual.proveedores.find(
    (item) => item.idProveedor === orden.proveedorId
  );

  return proveedor
    ? {
        idProveedor: proveedor.idProveedor,
        razonSocial: proveedor.razonSocial,
        nitRuc: proveedor.nitRuc,
      }
    : undefined;
}

/** Evento OrdenCompraConfirmada que se publicará a Contabilidad. */
function construirEventoContable(
  actual: EstadoCompartido,
  orden: OrdenCompra,
  referenciaLimpia: string,
  fecha: string,
): EventoOrdenCompraConfirmada {
  const proveedor = proveedorDeOrden(actual, orden);

  if (!proveedor) {
    throw new Error(
      "No se encontró el proveedor asociado a la orden para registrar el compromiso contable."
    );
  }

  if (
    actual.eventosOrdenCompraContabilidad.some(
      (item) => item.idOrden === orden.idOrden
    )
  ) {
    throw new Error(
      "Ya existe un evento contable para esta orden."
    );
  }

  if (
    !Number.isFinite(orden.total) ||
    orden.total <= 0 ||
    orden.detalles.length === 0 ||
    orden.detalles.some(
      (detalle) =>
        !Number.isSafeInteger(detalle.idDetalle) ||
        detalle.idDetalle <= 0 ||
        !Number.isSafeInteger(detalle.producto.idProducto) ||
        detalle.producto.idProducto <= 0 ||
        !Number.isSafeInteger(detalle.cantidad) ||
        detalle.cantidad <= 0 ||
        !Number.isFinite(detalle.precio) ||
        detalle.precio <= 0 ||
        !Number.isFinite(detalle.subtotal) ||
        detalle.subtotal <= 0
    )
  ) {
    throw new Error(
      "La orden contiene datos inválidos para registrar el compromiso contable."
    );
  }

  const idEvento =
    `ORDEN-COMPRA-CONFIRMADA-${orden.idOrden}`;
  return {
    idEvento,
    tipoEvento: "OrdenCompraConfirmada",
    correlationId: idEvento,
    fechaEvento: new Date().toISOString(),
    idOrden: orden.idOrden,
    numeroOrden: orden.numero,
    fechaOrden: orden.fecha,
    referenciaProveedor: referenciaLimpia,
    fechaConfirmacionProveedor: fecha,
    proveedor,
    total: orden.total,
    detalles: orden.detalles.map((detalle) => ({
      idDetalle: detalle.idDetalle,
      idProducto: detalle.producto.idProducto,
      producto: detalle.producto.descripcion,
      cantidad: detalle.cantidad,
      precioUnitario: detalle.precio,
      subtotal: detalle.subtotal,
    })),
    estadoPublicacion: "Pendiente",
    intentosPublicacion: [],
  };
}

interface DatosRespuestaProveedor {
  idOrden: number;
  estado: EstadoRespuestaProveedor;
  referencia: string;
  fecha: string;
  observacion: string;
}

export async function registrarRespuestaProveedor({
  idOrden,
  estado,
  referencia,
  fecha,
  observacion,
}: DatosRespuestaProveedor): Promise<EventoOrdenCompraConfirmada | undefined> {
  const referenciaLimpia = referencia.trim();
  const observacionLimpia = observacion.trim();

  if (estado !== "Confirmada" && estado !== "Rechazada") {
    throw new Error("La respuesta del proveedor no es válida.");
  }

  if (!referenciaLimpia) {
    throw new Error("La referencia del proveedor es obligatoria.");
  }

  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw new Error("Debes ingresar una fecha válida.");
  }

  const fechaSeleccionada = new Date(`${fecha}T12:00:00`);

  if (
    Number.isNaN(fechaSeleccionada.getTime()) ||
    [
      fechaSeleccionada.getFullYear(),
      String(fechaSeleccionada.getMonth() + 1).padStart(2, "0"),
      String(fechaSeleccionada.getDate()).padStart(2, "0"),
    ].join("-") !== fecha
  ) {
    throw new Error("La fecha ingresada no es válida.");
  }

  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999);

  if (fechaSeleccionada > hoy) {
    throw new Error("La fecha de respuesta no puede ser futura.");
  }

  if (conexion.ordenes) {
    return registrarRespuestaEnServidor(
      idOrden,
      estado,
      referenciaLimpia,
      fecha,
      observacionLimpia,
    );
  }

  let eventoCreado: EventoOrdenCompraConfirmada | undefined;

  actualizarCompras((actual) => {
    const orden = actual.ordenes.find(
      (item) => item.idOrden === idOrden
    );

    if (!orden) {
      throw new Error("No se encontró la orden de compra.");
    }

    if (orden.respuestaProveedor) {
      throw new Error(
        "Esta orden ya tiene una respuesta registrada. No se permiten respuestas duplicadas."
      );
    }

    if (orden.estado !== "Enviada") {
      throw new Error(
        "Solo se puede registrar una respuesta para una orden enviada."
      );
    }

    if (estado === "Confirmada") {
      eventoCreado = construirEventoContable(
        actual,
        orden,
        referenciaLimpia,
        fecha,
      );
    }

    const respuesta: RespuestaProveedor = {
      estado,
      referencia: referenciaLimpia,
      fecha,
      observacion: observacionLimpia,
    };

    return {
      ...actual,
      ordenes: actual.ordenes.map((item) => {
        if (item.idOrden !== idOrden) {
          return item;
        }

        return {
          ...item,
          estado,
          respuestaProveedor: respuesta,
          historialEstados: [
            ...(item.historialEstados ?? []),
            {
              estadoAnterior: "Enviada",
              estadoNuevo: estado,
              usuario: "Comprador",
              fecha: new Date().toISOString(),
              observacion:
                `Respuesta del proveedor registrada. ` +
                `Referencia: ${referenciaLimpia}. ` +
                `Fecha de respuesta: ${fecha}.` +
                (observacionLimpia
                  ? ` Observación: ${observacionLimpia}`
                  : ""),
            },
          ],
        };
      }),
      eventosOrdenCompraContabilidad: eventoCreado
        ? [
            ...actual.eventosOrdenCompraContabilidad,
            eventoCreado,
          ]
        : actual.eventosOrdenCompraContabilidad,
    };
  });

  return eventoCreado;
}

/**
 * Registra la respuesta en el servidor. El servidor no permite consultarla
 * después, así que se guarda también en el almacén; el evento para
 * Contabilidad se sigue preparando en la aplicación.
 */
async function registrarRespuestaEnServidor(
  idOrden: number,
  estado: EstadoRespuestaProveedor,
  referencia: string,
  fecha: string,
  observacion: string,
): Promise<EventoOrdenCompraConfirmada | undefined> {
  const orden = obtenerCompras().ordenes.find(
    (item) => item.idOrden === idOrden
  );

  if (!orden) {
    throw new Error("No se encontró la orden de compra.");
  }

  if (orden.estado !== "Enviada") {
    throw new Error(
      "Solo se puede registrar una respuesta para una orden enviada."
    );
  }

  const resultado = await api.registrarRespuesta(idOrden, {
    respuesta: estado === "Confirmada" ? "ACEPTADA" : "RECHAZADA",
    referencia,
    ...(observacion ? { observacion } : {}),
  });

  let eventoCreado: EventoOrdenCompraConfirmada | undefined;
  let errorEvento = "";

  actualizarCompras((actual) => {
    const vigente =
      actual.ordenes.find((item) => item.idOrden === idOrden) ?? orden;

    if (
      estado === "Confirmada" &&
      !actual.eventosOrdenCompraContabilidad.some(
        (item) => item.idOrden === idOrden
      )
    ) {
      try {
        eventoCreado = construirEventoContable(
          actual,
          vigente,
          referencia,
          fecha,
        );
      } catch (fallo) {
        errorEvento =
          fallo instanceof Error
            ? fallo.message
            : "No se pudo preparar el compromiso para Contabilidad.";
      }
    }

    const respuesta: RespuestaProveedor = {
      estado,
      referencia: resultado?.referencia ?? referencia,
      fecha,
      observacion: resultado?.observacion ?? observacion,
    };

    return {
      ...actual,
      ordenes: actual.ordenes.map((item) =>
        item.idOrden === idOrden
          ? { ...item, respuestaProveedor: respuesta }
          : item
      ),
      eventosOrdenCompraContabilidad: eventoCreado
        ? [...actual.eventosOrdenCompraContabilidad, eventoCreado]
        : actual.eventosOrdenCompraContabilidad,
    };
  });

  await finalizarOperacion(
    resultado?.yaRegistrada
      ? `La respuesta del proveedor para ${orden.numero} ya estaba registrada.`
      : estado === "Confirmada"
        ? `La orden ${orden.numero} quedó confirmada por el proveedor.`
        : `La orden ${orden.numero} quedó rechazada por el proveedor.`
  );

  if (errorEvento) {
    notificarMensaje(errorEvento, "error");
  }

  return eventoCreado;
}
