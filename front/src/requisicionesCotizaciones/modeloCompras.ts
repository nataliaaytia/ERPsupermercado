import { validarRequisicion, hayErrores } from "./validacionRequisicion";

import { consolidarRequisiciones } from "./consolidacionRequisiciones";

import type { AccionConsolidar } from "./consolidacionRequisiciones";

import type {
  DatosRequisicion,
  DetalleOferta,
  OfertaProveedor,
  Prioridad,
  ProveedorReferencia,
  Requisicion,
  SolicitudCotizacion,
} from "./tipos";
import type {
  AlertaReposicion,
  RegistroRecepcionAlerta,
  RegistroProcesamientoCompra,
} from "./tiposAlertasInventario";

import { revisarRequisicion } from "./revisionRequisicion";

export interface EstadoCompras {
  requisiciones: Requisicion[];
  solicitudes: SolicitudCotizacion[];
  ofertas: OfertaProveedor[];
  alertasInventario: RegistroRecepcionAlerta[];
  historialProcesamientos: RegistroProcesamientoCompra[];
  mensaje: string;
  tipoMensaje: "exito" | "error" | "neutro";
}

export const estadoInicial: EstadoCompras = {
  requisiciones: [],
  solicitudes: [],
  ofertas: [],
  alertasInventario: [],
  historialProcesamientos: [],
  mensaje: "",
  tipoMensaje: "neutro",
};

export type AccionCompras =
  | {
      tipo: "recibirAlertaInventario";
      alerta: AlertaReposicion;
      fechaRecepcion: string;
    }
  | {
      tipo: "limpiarAlertasInventario";
    }
  | {
      tipo: "cancelarRequisicion";
      id: number;
    }
  | AccionConsolidar
  | {
      tipo: "limpiarMensaje";
    }
  | {
      tipo: "crear";
      datos: DatosRequisicion;
      hoy: string;
    }
  | {
      tipo: "modificar";
      id: number;
      datos: DatosRequisicion;
    }
  | {
      tipo: "cambiarPrioridad";
      id: number;
      prioridad: Prioridad;
    }
  | {
      tipo: "aprobar" | "anular";
      id: number;
    }
  | {
      tipo: "generar";
      requisicion: number;
      fechaLimite: string;
      hoy: string;
    }
  | {
      tipo: "enviar";
      id: number;
      proveedores: ProveedorReferencia[];
      hoy: string;
    }
  | {
      tipo: "cancelar";
      id: number;
    }
  | {
      tipo: "cerrar";
      id: number;
      hoy: string;
    }
  | {
      tipo: "registrarOferta";
      solicitud: number;
      proveedor: ProveedorReferencia;
      validez: string;
      descuento: number;
      detalles: DetalleOferta[];
      hoy: string;
      condicionesEntrega: string;
    }
  | {
      tipo: "modificarOferta";
      id: number;
      validez: string;
      descuento: number;
      condicionesEntrega: string;
      detalles: DetalleOferta[];
      hoy: string;
    }
  | {
      tipo: "seleccionar" | "rechazar";
      id: number;
      hoy: string;
    };

const siguiente = (ids: number[]) => Math.max(0, ...ids) + 1;

const fechaValida = (fecha: string) => {
  const d = new Date(`${fecha}T00:00:00Z`);

  return (
    /^\d{4}-\d{2}-\d{2}$/.test(fecha) &&
    Number.isFinite(d.getTime()) &&
    d.toISOString().slice(0, 10) === fecha
  );
};

// Limite tecnico de captura (9 digitos enteros y 2 decimales).
// No representa un precio maximo comercial aprobado por el negocio.
const PRECIO_MAXIMO_TECNICO = 999999999.99;

const importeValido = (valor: number, permiteCero = false) =>
  Number.isFinite(valor) &&
  (permiteCero ? valor >= 0 : valor > 0) &&
  valor <= (permiteCero ? 100 : PRECIO_MAXIMO_TECNICO) &&
  Number(valor.toFixed(2)) === valor;

export function reducirCompras(
  e: EstadoCompras,
  a: AccionCompras,
): EstadoCompras {
  e = {
    ...e,
    tipoMensaje: "neutro",
  };

  const fallo = (mensaje: string): EstadoCompras => ({
    ...e,
    mensaje,
    tipoMensaje: "error",
  });

  if (a.tipo === "limpiarMensaje") {
    return {
      ...e,
      mensaje: "",
    };
  }
  if (a.tipo === "recibirAlertaInventario") {
    const alerta = a.alerta;
    const idEvento =
      typeof alerta.idEvento === "string" ? alerta.idEvento.trim() : "";

    const alertaValida =
      idEvento.length > 0 &&
      Number.isSafeInteger(alerta.idProducto) &&
      alerta.idProducto > 0 &&
      typeof alerta.nombreProducto === "string" &&
      alerta.nombreProducto.trim().length >= 3 &&
      Number.isFinite(alerta.cantidadActual) &&
      alerta.cantidadActual >= 0 &&
      Number.isFinite(alerta.stockMinimo) &&
      alerta.stockMinimo >= 0 &&
      Number.isSafeInteger(alerta.cantidadSugerida) &&
      alerta.cantidadSugerida >= 1 &&
      alerta.cantidadSugerida <= 10000 &&
      typeof alerta.fechaPublicacion === "string" &&
      Number.isFinite(Date.parse(alerta.fechaPublicacion)) &&
      typeof a.fechaRecepcion === "string" &&
      Number.isFinite(Date.parse(a.fechaRecepcion));

    if (!alertaValida) {
      return fallo("La alerta de Inventarios contiene datos inválidos.");
    }

    const procesamientoPrevio = e.historialProcesamientos.find(
      (registro) =>
        registro.idEvento.trim() === idEvento &&
        registro.resultado === "Procesado",
    );
    const yaProcesada =
      e.alertasInventario.some(
        (registro) => registro.idEvento.trim() === idEvento,
      ) || procesamientoPrevio !== undefined;

    const fechaIntento = a.fechaRecepcion;

    if (yaProcesada) {
      const registroDuplicado: RegistroProcesamientoCompra = {
        idEvento,
        idProducto: alerta.idProducto,
        nombreProducto: alerta.nombreProducto.trim(),
        fechaIntento,
        resultado: "Duplicado",
        mensaje: "Evento duplicado: ya fue procesado anteriormente.",
        idRequisicion: procesamientoPrevio?.idRequisicion,
      };

      return {
        ...e,
        historialProcesamientos: [
          ...e.historialProcesamientos,
          registroDuplicado,
        ],
        mensaje: registroDuplicado.mensaje,
        tipoMensaje: "error",
      };
    }

    const idRequisicion = siguiente(
      e.requisiciones.map((requisicion) => requisicion.idRequisicion),
    );
    const requisicion: Requisicion = {
      idRequisicion,
      fecha: new Date(fechaIntento).toISOString().slice(0, 10),
      solicitante: "Sistema de Inventarios",
      prioridad: "Media",
      estado: "Pendiente",
      observacion: `Reposición generada automáticamente desde la alerta de Inventarios ${idEvento}.`,
      detalles: [
        {
          idDetalle: 1,
          producto: {
            idProducto: alerta.idProducto,
            descripcion: alerta.nombreProducto.trim(),
          },
          cantidad: alerta.cantidadSugerida,
          observacion: `Alerta de Inventarios ${idEvento}.`,
        },
      ],
    };
    const revisionRequisicion = revisarRequisicion(requisicion);

    if (revisionRequisicion.errores.length > 0) {
      return fallo(
        `No se pudo generar la requisición desde la alerta: ${revisionRequisicion.errores.join(" ")}`,
      );
    }

    const registro: RegistroRecepcionAlerta = {
      idEvento,
      idProducto: alerta.idProducto,
      nombreProducto: alerta.nombreProducto.trim(),
      cantidadActual: alerta.cantidadActual,
      stockMinimo: alerta.stockMinimo,
      cantidadSugerida: alerta.cantidadSugerida,
      fechaPublicacion: alerta.fechaPublicacion,
      fechaRecepcion: fechaIntento,
      estado: "Procesada",
      mensaje: `Alerta procesada y vinculada a la requisición REQ-${String(idRequisicion).padStart(4, "0")}.`,
    };

    const registroProcesamiento: RegistroProcesamientoCompra = {
      idEvento,
      idProducto: alerta.idProducto,
      nombreProducto: alerta.nombreProducto.trim(),
      fechaIntento,
      resultado: "Procesado",
      mensaje: `Evento procesado; se generó la requisición REQ-${String(idRequisicion).padStart(4, "0")}.`,
      idRequisicion,
    };

    return {
      ...e,
      requisiciones: [...e.requisiciones, requisicion],
      alertasInventario: [...e.alertasInventario, registro],
      historialProcesamientos: [
        ...e.historialProcesamientos,
        registroProcesamiento,
      ],
      mensaje: registroProcesamiento.mensaje,
      tipoMensaje: "exito",
    };
  }
  if (a.tipo === "limpiarAlertasInventario") {
    return {
      ...e,
      alertasInventario: [],
      historialProcesamientos: [],
      mensaje: "Se limpiaron los historiales de alertas y procesamientos.",
      tipoMensaje: "exito",
    };
  }

  if (a.tipo === "cambiarPrioridad") {
    const requisicion = e.requisiciones.find((r) => r.idRequisicion === a.id);

    if (!requisicion) {
      return fallo("La requisición no existe.");
    }

    if (
      requisicion.estado !== "Pendiente" ||
      e.solicitudes.some((s) => s.requisicion === a.id)
    ) {
      return fallo(
        "Solo puedes cambiar la prioridad de una requisición pendiente sin procesar.",
      );
    }

    if (!["Baja", "Media", "Alta"].includes(a.prioridad)) {
      return fallo("Selecciona una prioridad válida: Baja, Media o Alta.");
    }

    return {
      ...e,
      requisiciones: e.requisiciones.map((r) =>
        r.idRequisicion === a.id
          ? {
              ...r,
              prioridad: a.prioridad,
            }
          : r,
      ),
      mensaje: `Prioridad actualizada a ${a.prioridad}.`,
      tipoMensaje: "exito",
    };
  }

  if (a.tipo === "modificar") {
    const actual = e.requisiciones.find((r) => r.idRequisicion === a.id);

    if (!actual) {
      return fallo("La requisición no existe.");
    }

    if (
      actual.estado !== "Pendiente" ||
      e.solicitudes.some((s) => s.requisicion === a.id)
    ) {
      return fallo("Esta requisición ya fue procesada y no se puede editar.");
    }

    const errores = validarRequisicion(a.datos);

    if (hayErrores(errores)) {
      const mensajes = [
        errores.general,
        errores.motivo,
        ...Object.values(errores.productos).flatMap((error) => [
          error.nombre,
          error.cantidad,
        ]),
      ].filter(Boolean);

      return fallo(mensajes.join(" "));
    }

    const idsDetalle = a.datos.productos.map((p) => p.id);

    if (
      new Set(idsDetalle).size !== idsDetalle.length ||
      idsDetalle.some((id) => !Number.isSafeInteger(id) || id < 1)
    ) {
      return fallo(
        "Los identificadores internos de los detalles no son válidos.",
      );
    }

    const productos = e.requisiciones.flatMap((r) =>
      r.detalles.map((d) => d.producto),
    );

    const porNombre = new Map(
      productos.map((p) => [p.descripcion.trim().toLowerCase(), p]),
    );

    let siguienteProducto =
      Math.max(0, ...productos.map((p) => p.idProducto)) + 1;

    const actualizada: Requisicion = {
      ...actual,
      solicitante: a.datos.solicitante.trim(),
      prioridad: a.datos.prioridad,
      observacion: a.datos.motivo.trim(),
      detalles: a.datos.productos.map((p) => {
        const nombre = p.nombre.trim();
        const clave = nombre.toLowerCase();

        let producto = porNombre.get(clave);

        if (!producto) {
          producto = {
            idProducto: siguienteProducto++,
            descripcion: nombre,
          };

          porNombre.set(clave, producto);
        }

        return {
          idDetalle: p.id,
          producto: { ...producto },
          cantidad: Number(p.cantidad),
          observacion: p.observacion.trim(),
        };
      }),
    };

    const revision = revisarRequisicion(actualizada);

    if (revision.errores.length) {
      return fallo(revision.errores.join(" "));
    }

    delete actualizada.validacion;

    return {
      ...e,
      requisiciones: e.requisiciones.map((r) =>
        r.idRequisicion === a.id ? actualizada : r,
      ),
      mensaje: "Cambios de la requisición guardados.",
      tipoMensaje: "exito",
    };
  }
  if (a.tipo === "consolidar") {
    return consolidarRequisiciones(e, a);
  }
  if (a.tipo === "cancelarRequisicion") {
    const requisicion = e.requisiciones.find((r) => r.idRequisicion === a.id);

    if (!requisicion) {
      return fallo("La requisición no existe.");
    }

    if (
      requisicion.estado !== "Pendiente" ||
      e.solicitudes.some((solicitud) => solicitud.requisicion === a.id)
    ) {
      return fallo(
        "Solo puedes cancelar requisiciones pendientes y sin procesar.",
      );
    }

    return {
      ...e,
      requisiciones: e.requisiciones.map(
        (r): Requisicion =>
          r.idRequisicion === a.id
            ? {
                ...r,
                estado: "Cancelada",
              }
            : r,
      ),
      mensaje: "Requisición cancelada correctamente.",
      tipoMensaje: "exito",
    };
  }
  if (a.tipo === "crear") {
    const existentes = e.requisiciones.flatMap((r) =>
      r.detalles.map((d) => d.producto),
    );

    const porNombre = new Map(
      existentes.map((p) => [p.descripcion.trim().toLowerCase(), p]),
    );

    let siguienteProducto = siguiente(existentes.map((p) => p.idProducto));

    const detalles: Requisicion["detalles"] = a.datos.productos.map((p, i) => {
      const nombre = p.nombre.trim();
      const clave = nombre.toLowerCase();

      let producto = porNombre.get(clave);

      if (!producto) {
        producto = {
          idProducto: siguienteProducto++,
          descripcion: nombre,
        };

        porNombre.set(clave, producto);
      }

      return {
        idDetalle: i + 1,
        producto: { ...producto },
        cantidad: Number(p.cantidad),
        observacion: p.observacion.trim(),
      };
    });

    const nueva: Requisicion = {
      idRequisicion: siguiente(e.requisiciones.map((r) => r.idRequisicion)),
      fecha: a.hoy,
      solicitante: a.datos.solicitante.trim(),
      prioridad: a.datos.prioridad,
      estado: "Pendiente",
      observacion: a.datos.motivo.trim(),
      detalles,
    };

    const revision = revisarRequisicion(nueva);

    if (revision.errores.length) {
      return fallo(revision.errores.join(" "));
    }

    return {
      ...e,
      requisiciones: [...e.requisiciones, nueva],
      mensaje: "Requisición registrada.",
      tipoMensaje: "exito",
    };
  }

  if (a.tipo === "aprobar" || a.tipo === "anular") {
    const requisicion = e.requisiciones.find((r) => r.idRequisicion === a.id);

    if (!requisicion || requisicion.estado !== "Pendiente") {
      return fallo("Solo se modifica una requisición pendiente.");
    }

    const validacion = revisarRequisicion(requisicion);

    const estado: Requisicion["estado"] =
      a.tipo === "anular"
        ? "Anulada"
        : validacion.errores.length
          ? "Pendiente"
          : "Aprobada";

    return {
      ...e,
      requisiciones: e.requisiciones.map((r) =>
        r.idRequisicion === a.id
          ? {
              ...r,
              estado,
              validacion: a.tipo === "aprobar" ? validacion : r.validacion,
            }
          : r,
      ),
      mensaje:
        estado === "Pendiente"
          ? "Corrige los errores antes de aprobar."
          : `Requisición ${estado.toLowerCase()}.`,
      tipoMensaje: estado === "Pendiente" ? "error" : "exito",
    };
  }

  if (a.tipo === "generar") {
    const requisicion = e.requisiciones.find(
      (r) => r.idRequisicion === a.requisicion,
    );

    if (requisicion?.estado !== "Aprobada") {
      return fallo("Selecciona una requisición aprobada.");
    }

    if (!fechaValida(a.fechaLimite) || a.fechaLimite < a.hoy) {
      return fallo("Fecha límite inválida o pasada.");
    }

    const solicitud: SolicitudCotizacion = {
      idSolicitud: siguiente(e.solicitudes.map((s) => s.idSolicitud)),
      requisicion: a.requisicion,
      fecha: a.hoy,
      fechaLimite: a.fechaLimite,
      estado: "Generada",
      proveedoresIds: [],
    };

    return {
      ...e,
      solicitudes: [...e.solicitudes, solicitud],
      mensaje: "Solicitud de cotización generada correctamente.",
      tipoMensaje: "exito",
    };
  }

  if (a.tipo === "enviar") {
    const solicitud = e.solicitudes.find((s) => s.idSolicitud === a.id);

    if (!solicitud || solicitud.estado !== "Generada") {
      return fallo("Solo se envían solicitudes generadas.");
    }

    if (solicitud.fechaLimite < a.hoy) {
      return fallo("La fecha límite ya venció.");
    }

    if (
      !a.proveedores.length ||
      a.proveedores.some((p) => p.estado !== "Activo")
    ) {
      return fallo("Selecciona al menos un proveedor activo.");
    }

    return {
      ...e,
      solicitudes: e.solicitudes.map((s) =>
        s.idSolicitud === a.id
          ? {
              ...s,
              estado: "Enviada",
              proveedoresIds: [
                ...new Set(a.proveedores.map((p) => p.idProveedor)),
              ],
            }
          : s,
      ),
      mensaje:
        "Proveedores asociados correctamente a la solicitud de cotización.",
      tipoMensaje: "exito",
    };
  }

  if (a.tipo === "cerrar") {
    const solicitud = e.solicitudes.find((s) => s.idSolicitud === a.id);

    if (!solicitud || solicitud.estado !== "Enviada") {
      return fallo("Solo se pueden cerrar solicitudes enviadas.");
    }

    if (!fechaValida(a.hoy) || solicitud.fechaLimite >= a.hoy) {
      return fallo("La solicitud solo se puede cerrar después de su fecha límite.");
    }

    if (
      e.ofertas.some(
        (oferta) =>
          oferta.solicitud === a.id && oferta.estado === "Seleccionada",
      )
    ) {
      return fallo("No se puede cerrar una solicitud con una oferta ya seleccionada.");
    }

    return {
      ...e,
      solicitudes: e.solicitudes.map((s) =>
        s.idSolicitud === a.id ? { ...s, estado: "Cerrada" } : s,
      ),
      mensaje: `Solicitud COT-${String(a.id).padStart(4, "0")} cerrada correctamente. Las ofertas se conservaron para evaluación.`,
      tipoMensaje: "exito",
    };
  }

  if (a.tipo === "cancelar") {
    const solicitud = e.solicitudes.find((s) => s.idSolicitud === a.id);

    if (!solicitud || solicitud.estado === "Cancelada") {
      return fallo("La solicitud no está disponible.");
    }

    if (
      e.ofertas.some((o) => o.solicitud === a.id && o.estado === "Seleccionada")
    ) {
      return fallo("La solicitud ya tiene una oferta seleccionada.");
    }

    return {
      ...e,
      solicitudes: e.solicitudes.map((s) =>
        s.idSolicitud === a.id ? { ...s, estado: "Cancelada" } : s,
      ),
      ofertas: e.ofertas.map((o) =>
        o.solicitud === a.id ? { ...o, estado: "Rechazada" } : o,
      ),
      mensaje: "Solicitud cancelada; sus ofertas quedaron rechazadas.",
      tipoMensaje: "exito",
    };
  }

  if (a.tipo === "registrarOferta") {
    const solicitud = e.solicitudes.find((s) => s.idSolicitud === a.solicitud);

    const requisicion = e.requisiciones.find(
      (r) => r.idRequisicion === solicitud?.requisicion,
    );

    if (
      !solicitud ||
      !requisicion ||
      solicitud.estado !== "Enviada" ||
      solicitud.fechaLimite < a.hoy
    ) {
      return fallo("La solicitud debe estar enviada y dentro de plazo.");
    }

    if (
      a.proveedor.estado !== "Activo" ||
      !solicitud.proveedoresIds.includes(a.proveedor.idProveedor)
    ) {
      return fallo(
        "El proveedor debe estar activo e invitado a esta solicitud.",
      );
    }

    if (
      e.ofertas.some(
        (o) =>
          o.solicitud === solicitud.idSolicitud && o.estado === "Seleccionada",
      )
    ) {
      return fallo("Esta solicitud ya tiene una oferta seleccionada.");
    }

    if (
      e.ofertas.some(
        (o) =>
          o.solicitud === solicitud.idSolicitud &&
          o.proveedor.idProveedor === a.proveedor.idProveedor,
      )
    ) {
      return fallo(
        "Este proveedor ya tiene una oferta registrada en esta solicitud.",
      );
    }

    if (!fechaValida(a.validez) || a.validez < a.hoy) {
      return fallo("La validez de la oferta es inválida.");
    }
    if (!Number.isFinite(a.descuento) || a.descuento < 0 || a.descuento > 100) {
      return fallo("El descuento debe estar entre 0 y 100 por ciento.");
    }
    if (
      typeof a.condicionesEntrega !== "string" ||
      !a.condicionesEntrega.trim() ||
      a.condicionesEntrega.trim().length > 500
    ) {
      return fallo(
        "Las condiciones de entrega son obligatorias y no deben superar los 500 caracteres.",
      );
    }

    const ids = a.detalles.map((d) => d.producto.idProducto);

    if (
      ids.length !== requisicion.detalles.length ||
      new Set(ids).size !== ids.length ||
      requisicion.detalles.some((d) => !ids.includes(d.producto.idProducto)) ||
      a.detalles.some(
        (d) =>
          !Number.isFinite(d.precio) ||
          d.precio <= 0 ||
          !Number.isSafeInteger(d.plazoEntrega) ||
          d.plazoEntrega < 1,
      )
    ) {
      return fallo(
        "Cotiza todos los productos con precio positivo y plazo entero mayor a cero.",
      );
    }

    const oferta: OfertaProveedor = {
      idOferta: siguiente(e.ofertas.map((o) => o.idOferta)),
      proveedor: { ...a.proveedor },
      solicitud: solicitud.idSolicitud,
      fecha: a.hoy,
      validez: a.validez,
      estado: "Registrada",
      descuento: a.descuento,
      condicionesEntrega: a.condicionesEntrega.trim(),
      detalles: a.detalles.map((d, i) => ({
        ...d,
        idDetalle: i + 1,
        producto: {
          ...requisicion.detalles.find(
            (item) => item.producto.idProducto === d.producto.idProducto,
          )!.producto,
        },
      })),
    };

    return {
      ...e,
      ofertas: [...e.ofertas, oferta],
      mensaje: "Oferta del proveedor registrada correctamente.",
      tipoMensaje: "exito",
    };
  }

  if (a.tipo === "modificarOferta") {
    const oferta = e.ofertas.find((o) => o.idOferta === a.id);

    if (!oferta) {
      return fallo("La oferta no existe.");
    }

    const solicitud = e.solicitudes.find(
      (s) => s.idSolicitud === oferta.solicitud,
    );

    if (
      oferta.estado !== "Registrada" ||
      solicitud?.estado !== "Enviada" ||
      solicitud.fechaLimite < a.hoy ||
      e.ofertas.some(
        (o) =>
          o.solicitud === oferta.solicitud &&
          o.estado === "Seleccionada",
      )
    ) {
      return fallo("Esta oferta ya no se puede editar.");
    }

    if (!fechaValida(a.validez) || a.validez < a.hoy) {
      return fallo("La fecha de validez de la oferta es inválida.");
    }

    if (
      !importeValido(a.descuento, true)
    ) {
      return fallo("El descuento debe estar entre 0 y 100 y tener máximo dos decimales.");
    }

    if (
      typeof a.condicionesEntrega !== "string" ||
      !a.condicionesEntrega.trim() ||
      a.condicionesEntrega.trim().length > 500
    ) {
      return fallo(
        "Las condiciones de entrega son obligatorias y no deben superar los 500 caracteres.",
      );
    }

    const productosOriginales = oferta.detalles.map(
      (d) => d.producto.idProducto,
    );
    const productosNuevos = a.detalles.map(
      (d) => d.producto.idProducto,
    );

    if (
      productosNuevos.length !== productosOriginales.length ||
      new Set(productosNuevos).size !== productosNuevos.length ||
      productosOriginales.some((id) => !productosNuevos.includes(id)) ||
      a.detalles.some(
        (d) =>
          !importeValido(d.precio) ||
          !Number.isSafeInteger(d.plazoEntrega) ||
          d.plazoEntrega < 1,
      )
    ) {
      return fallo(
        "Cada precio debe ser mayor a cero, tener máximo dos decimales y no superar Bs 999.999.999,99. El plazo debe ser un entero mayor a cero.",
      );
    }

    return {
      ...e,
      ofertas: e.ofertas.map((actual) =>
        actual.idOferta === oferta.idOferta
          ? {
              ...actual,
              validez: a.validez,
              descuento: a.descuento,
              condicionesEntrega: a.condicionesEntrega.trim(),
              detalles: actual.detalles.map((detalle) => {
                const modificado = a.detalles.find(
                  (d) =>
                    d.producto.idProducto === detalle.producto.idProducto,
                );

                return {
                  ...detalle,
                  precio: modificado!.precio,
                  plazoEntrega: modificado!.plazoEntrega,
                };
              }),
            }
          : actual,
      ),
      mensaje: `Oferta OF-${String(oferta.idOferta).padStart(4, "0")} actualizada correctamente.`,
      tipoMensaje: "exito",
    };
  }

  if (a.tipo === "seleccionar" || a.tipo === "rechazar") {
    const oferta = e.ofertas.find((o) => o.idOferta === a.id);

    const solicitud = e.solicitudes.find(
      (s) => s.idSolicitud === oferta?.solicitud,
    );

    if (
      !oferta ||
      oferta.estado !== "Registrada" ||
      solicitud?.estado !== "Cerrada"
    ) {
      return fallo("La oferta no está disponible para evaluación.");
    }

    if (
      a.tipo === "seleccionar" &&
      (oferta.validez < a.hoy ||
        e.ofertas.some(
          (o) =>
            o.solicitud === oferta.solicitud && o.estado === "Seleccionada",
        ))
    ) {
      return fallo("La oferta venció o ya existe otra seleccionada.");
    }

    return {
      ...e,
      ofertas: e.ofertas.map((o) =>
        o.idOferta === oferta.idOferta
          ? {
              ...o,
              estado: a.tipo === "seleccionar" ? "Seleccionada" : "Rechazada",
            }
          : a.tipo === "seleccionar" &&
              o.solicitud === oferta.solicitud &&
              o.estado === "Registrada"
            ? { ...o, estado: "Rechazada" }
            : o,
      ),
      mensaje:
        a.tipo === "seleccionar"
          ? `La oferta OF-${String(oferta.idOferta).padStart(4, "0")} fue seleccionada como ganadora para ${oferta.proveedor.razonSocial} en la solicitud COT-${String(oferta.solicitud).padStart(4, "0")}.`
          : "Oferta rechazada correctamente.",
      tipoMensaje: "exito",
    };
  }

  return e;
}
