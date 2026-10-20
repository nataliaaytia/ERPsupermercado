import type {
    DatosRequisicion,
    DetalleOferta,
    OfertaProveedor,
    ProveedorReferencia,
    Requisicion,
    SolicitudCotizacion,
} from "./tipos";
import { revisarRequisicion } from "./revisionRequisicion";

export interface EstadoCompras {
    requisiciones: Requisicion[];
    solicitudes: SolicitudCotizacion[];
    ofertas: OfertaProveedor[];
    mensaje: string;
}

export const estadoInicial: EstadoCompras = {
    requisiciones: [],
    solicitudes: [],
    ofertas: [],
    mensaje: "",
};

export type AccionCompras =
    | { tipo: "limpiarMensaje" }
    | {
        tipo: "crear";
        datos: DatosRequisicion;
        hoy: string;
    }
    | {
        tipo: "crear";
        datos: DatosRequisicion;
        hoy: string;
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
        tipo: "registrarOferta";
        solicitud: number;
        proveedor: ProveedorReferencia;
        validez: string;
        detalles: DetalleOferta[];
        hoy: string;
    }
    | {
        tipo: "seleccionar" | "rechazar";
        id: number;
        hoy: string;
    };

const siguiente = (ids: number[]) =>
    Math.max(0, ...ids) + 1;

const fechaValida = (fecha: string) => {
    const d = new Date(`${fecha}T00:00:00Z`);

    return (
        /^\d{4}-\d{2}-\d{2}$/.test(fecha) &&
        Number.isFinite(d.getTime()) &&
        d.toISOString().slice(0, 10) === fecha
    );
};

export function reducirCompras(
    e: EstadoCompras,
    a: AccionCompras,
): EstadoCompras {
    const fallo = (mensaje: string): EstadoCompras => ({
        ...e,
        mensaje,
    });

    if (a.tipo === "limpiarMensaje") {
        return {
            ...e,
            mensaje: "",
        };
    }

    if (a.tipo === "crear") {
        const existentes = e.requisiciones.flatMap(r =>
            r.detalles.map(d => d.producto),
        );

        const porNombre = new Map(
            existentes.map(p => [
                p.descripcion.trim().toLowerCase(),
                p,
            ]),
        );

        let siguienteProducto = siguiente(
            existentes.map(p => p.idProducto),
        );

        const detalles: Requisicion["detalles"] =
            a.datos.productos.map((p, i) => {
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

        const r: Requisicion = {
            idRequisicion: siguiente(
                e.requisiciones.map(r => r.idRequisicion),
            ),
            fecha: a.hoy,
            solicitante: a.datos.solicitante.trim(),
            prioridad: a.datos.prioridad,
            estado: "Pendiente",
            observacion: a.datos.motivo.trim(),
            detalles,
        };

        const revision = revisarRequisicion(r);

        if (revision.errores.length) {
            return fallo(revision.errores.join(" "));
        }

        return {
            ...e,
            requisiciones: [...e.requisiciones, r],
            mensaje: "Requisición registrada.",
        };
    }

    if (a.tipo === "aprobar" || a.tipo === "anular") {
        const r = e.requisiciones.find(
            r => r.idRequisicion === a.id,
        );

        if (!r || r.estado !== "Pendiente") {
            return fallo(
                "Solo se modifica una requisición pendiente.",
            );
        }

        const validacion = revisarRequisicion(r);

        const estado: Requisicion["estado"] =
            a.tipo === "anular"
                ? "Anulada"
                : validacion.errores.length
                    ? "Pendiente"
                    : "Aprobada";

        return {
            ...e,
            requisiciones: e.requisiciones.map(item =>
                item.idRequisicion === a.id
                    ? {
                        ...item,
                        estado,
                        validacion:
                            a.tipo === "aprobar"
                                ? validacion
                                : item.validacion,
                    }
                    : item,
            ),
            mensaje:
                estado === "Pendiente"
                    ? "Corrige los errores antes de aprobar."
                    : `Requisición ${estado.toLowerCase()}.`,
        };
    }

    if (a.tipo === "generar") {
        const r = e.requisiciones.find(
            r => r.idRequisicion === a.requisicion,
        );

        if (r?.estado !== "Aprobada") {
            return fallo(
                "Selecciona una requisición aprobada.",
            );
        }

        if (
            !fechaValida(a.fechaLimite) ||
            a.fechaLimite < a.hoy
        ) {
            return fallo(
                "Fecha límite inválida o pasada.",
            );
        }

        const solicitud: SolicitudCotizacion = {
            idSolicitud: siguiente(
                e.solicitudes.map(s => s.idSolicitud),
            ),
            requisicion: a.requisicion,
            fecha: a.hoy,
            fechaLimite: a.fechaLimite,
            estado: "Generada",
            proveedoresIds: [],
        };

        return {
            ...e,
            solicitudes: [...e.solicitudes, solicitud],
            mensaje: "Solicitud generada.",
        };
    }

    if (a.tipo === "enviar") {
        const s = e.solicitudes.find(
            s => s.idSolicitud === a.id,
        );

        if (!s || s.estado !== "Generada") {
            return fallo(
                "Solo se envían solicitudes generadas.",
            );
        }

        if (s.fechaLimite < a.hoy) {
            return fallo(
                "La fecha límite ya venció.",
            );
        }

        if (
            !a.proveedores.length ||
            a.proveedores.some(p => p.estado !== "Activo")
        ) {
            return fallo(
                "Selecciona al menos un proveedor activo.",
            );
        }

        return {
            ...e,
            solicitudes: e.solicitudes.map(item =>
                item.idSolicitud === a.id
                    ? {
                        ...item,
                        estado: "Enviada",
                        proveedoresIds: [
                            ...new Set(
                                a.proveedores.map(p => p.idProveedor),
                            ),
                        ],
                    }
                    : item,
            ),
            mensaje:
                "Solicitud marcada como enviada (demostración local).",
        };
    }

    if (a.tipo === "cancelar") {
        const s = e.solicitudes.find(
            s => s.idSolicitud === a.id,
        );

        if (!s || s.estado === "Cancelada") {
            return fallo(
                "La solicitud no está disponible.",
            );
        }

        if (
            e.ofertas.some(
                o =>
                    o.solicitud === a.id &&
                    o.estado === "Seleccionada",
            )
        ) {
            return fallo(
                "La solicitud ya tiene una oferta seleccionada.",
            );
        }

        return {
            ...e,
            solicitudes: e.solicitudes.map(item =>
                item.idSolicitud === a.id
                    ? { ...item, estado: "Cancelada" }
                    : item,
            ),
            ofertas: e.ofertas.map(o =>
                o.solicitud === a.id
                    ? { ...o, estado: "Rechazada" }
                    : o,
            ),
            mensaje:
                "Solicitud cancelada; sus ofertas quedaron rechazadas.",
        };
    }

    if (a.tipo === "registrarOferta") {
        const s = e.solicitudes.find(
            s => s.idSolicitud === a.solicitud,
        );

        const r = e.requisiciones.find(
            r => r.idRequisicion === s?.requisicion,
        );

        if (
            !s ||
            !r ||
            s.estado !== "Enviada" ||
            s.fechaLimite < a.hoy
        ) {
            return fallo(
                "La solicitud debe estar enviada y dentro de plazo.",
            );
        }

        if (
            a.proveedor.estado !== "Activo" ||
            !s.proveedoresIds.includes(
                a.proveedor.idProveedor,
            )
        ) {
            return fallo(
                "El proveedor debe estar activo e invitado a esta solicitud.",
            );
        }

        if (
            e.ofertas.some(
                o =>
                    o.solicitud === s.idSolicitud &&
                    o.estado === "Seleccionada",
            )
        ) {
            return fallo(
                "Esta solicitud ya tiene una oferta seleccionada.",
            );
        }

        if (
            e.ofertas.some(
                o =>
                    o.solicitud === s.idSolicitud &&
                    o.proveedor.idProveedor ===
                    a.proveedor.idProveedor,
            )
        ) {
            return fallo(
                "Este proveedor ya tiene una oferta registrada en esta solicitud.",
            );
        }

        if (
            !fechaValida(a.validez) ||
            a.validez < a.hoy
        ) {
            return fallo(
                "La validez de la oferta es inválida.",
            );
        }

        const ids = a.detalles.map(
            d => d.producto.idProducto,
        );

        if (
            ids.length !== r.detalles.length ||
            new Set(ids).size !== ids.length ||
            r.detalles.some(
                d => !ids.includes(d.producto.idProducto),
            ) ||
            a.detalles.some(
                d =>
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
            idOferta: siguiente(
                e.ofertas.map(o => o.idOferta),
            ),
            proveedor: { ...a.proveedor },
            solicitud: s.idSolicitud,
            fecha: a.hoy,
            validez: a.validez,
            estado: "Registrada",
            detalles: a.detalles.map((d, i) => ({
                ...d,
                idDetalle: i + 1,
                producto: {
                    ...r.detalles.find(
                        item =>
                            item.producto.idProducto ===
                            d.producto.idProducto,
                    )!.producto,
                },
            })),
        };

        return {
            ...e,
            ofertas: [...e.ofertas, oferta],
            mensaje: "Oferta registrada.",
        };
    }

    if (
        a.tipo === "seleccionar" ||
        a.tipo === "rechazar"
    ) {
        const o = e.ofertas.find(
            o => o.idOferta === a.id,
        );

        const s = e.solicitudes.find(
            s => s.idSolicitud === o?.solicitud,
        );

        if (
            !o ||
            o.estado !== "Registrada" ||
            s?.estado !== "Enviada"
        ) {
            return fallo(
                "La oferta no está disponible.",
            );
        }

        if (
            a.tipo === "seleccionar" &&
            (
                o.validez < a.hoy ||
                e.ofertas.some(
                    item =>
                        item.solicitud === o.solicitud &&
                        item.estado === "Seleccionada",
                )
            )
        ) {
            return fallo(
                "La oferta venció o ya existe otra seleccionada.",
            );
        }

        return {
            ...e,
            ofertas: e.ofertas.map(item =>
                item.idOferta === o.idOferta
                    ? {
                        ...item,
                        estado:
                            a.tipo === "seleccionar"
                                ? "Seleccionada"
                                : "Rechazada",
                    }
                    : a.tipo === "seleccionar" &&
                        item.solicitud === o.solicitud &&
                        item.estado === "Registrada"
                        ? { ...item, estado: "Rechazada" }
                        : item,
            ),
            mensaje:
                "Estado de la oferta actualizado.",
        };
    }

    return e;
}