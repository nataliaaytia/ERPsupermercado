import type { EstadoCompras } from "./modeloCompras";

import type {
    DetalleRequisicion,
    Prioridad,
    Requisicion,
    SolicitudCotizacion,
} from "./tipos";

import { revisarRequisicion } from "./revisionRequisicion";

export interface AccionConsolidar {
    tipo: "consolidar";
    ids: number[];
    solicitante: string;
    observacion: string;
    fechaLimite: string;
    hoy: string;
}

export interface ResumenConsolidacion {
    detalles: DetalleRequisicion[];
    prioridad: Prioridad;
    errores: string[];
}

const codigo = (id: number) =>
    `REQ-${String(id).padStart(4, "0")}`;

const pesos: Record<Prioridad, number> = {
    Baja: 1,
    Media: 2,
    Alta: 3,
};

export function resumirRequisiciones(
    requisiciones: Requisicion[],
): ResumenConsolidacion {
    const errores: string[] = [];
    let prioridad: Prioridad = "Baja";

    const agrupados =
        new Map<number, DetalleRequisicion>();

    for (const requisicion of requisiciones) {
        const revision = revisarRequisicion(requisicion);

        errores.push(
            ...revision.errores.map(
                error =>
                    `${codigo(requisicion.idRequisicion)}: ${error}`,
            ),
        );

        if (
            pesos[requisicion.prioridad] >
            pesos[prioridad]
        ) {
            prioridad = requisicion.prioridad;
        }

        for (const detalle of requisicion.detalles) {
            const id = detalle.producto.idProducto;
            const existente = agrupados.get(id);

            const observacion = detalle.observacion.trim();

            const nota =
                `${codigo(requisicion.idRequisicion)}: ` +
                `${detalle.cantidad} unidades` +
                (observacion ? ` — ${observacion}` : "");

            if (existente) {
                const nombreExistente =
                    existente.producto.descripcion
                        .trim()
                        .toLowerCase();

                const nombreActual =
                    detalle.producto.descripcion
                        .trim()
                        .toLowerCase();

                if (nombreExistente !== nombreActual) {
                    errores.push(
                        `El producto ${id} tiene descripciones diferentes. Revisa el catálogo antes de consolidar.`,
                    );
                }

                existente.cantidad += detalle.cantidad;
                existente.observacion += `\n${nota}`;
            } else {
                agrupados.set(id, {
                    idDetalle: agrupados.size + 1,
                    producto: { ...detalle.producto },
                    cantidad: detalle.cantidad,
                    observacion: nota,
                });
            }
        }
    }

    for (const detalle of agrupados.values()) {
        if (
            !Number.isSafeInteger(detalle.cantidad) ||
            detalle.cantidad < 1 ||
            detalle.cantidad > 10000
        ) {
            errores.push(
                `${detalle.producto.descripcion}: la cantidad agrupada debe estar entre 1 y 10000.`,
            );
        }
    }

    return {
        detalles: [...agrupados.values()],
        prioridad,
        errores: [...new Set(errores)],
    };
}

export function consolidarRequisiciones(
    estado: EstadoCompras,
    accion: AccionConsolidar,
): EstadoCompras {
    const fallo = (mensaje: string): EstadoCompras => ({
        ...estado,
        mensaje,
        tipoMensaje: "error",
    });

    const ids = new Set(accion.ids);

    if (
        ids.size < 2 ||
        ids.size !== accion.ids.length
    ) {
        return fallo(
            "Selecciona al menos dos requisiciones diferentes.",
        );
    }

    const origenes = estado.requisiciones.filter(
        requisicion =>
            ids.has(requisicion.idRequisicion),
    );

    if (origenes.length !== ids.size) {
        return fallo(
            "Una requisición seleccionada ya no existe.",
        );
    }

    if (
        origenes.some(
            requisicion =>
                requisicion.estado !== "Aprobada",
        ) ||
        estado.solicitudes.some(
            solicitud =>
                ids.has(solicitud.requisicion),
        )
    ) {
        return fallo(
            "Solo puedes consolidar requisiciones aprobadas y sin solicitudes de cotización previas.",
        );
    }

    const fecha = new Date(
        `${accion.fechaLimite}T00:00:00Z`,
    );

    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
            accion.fechaLimite,
        ) ||
        !Number.isFinite(fecha.getTime()) ||
        fecha.toISOString().slice(0, 10) !==
        accion.fechaLimite ||
        accion.fechaLimite < accion.hoy
    ) {
        return fallo(
            "Selecciona una fecha límite válida que no esté en el pasado.",
        );
    }

    const resumen = resumirRequisiciones(origenes);

    if (resumen.errores.length) {
        return fallo(
            resumen.errores.join(" "),
        );
    }

    if (accion.observacion.trim().length < 10) {
        return fallo(
            "Explica el motivo de consolidación en al menos 10 caracteres.",
        );
    }

    const idRequisicion =
        Math.max(
            0,
            ...estado.requisiciones.map(
                requisicion =>
                    requisicion.idRequisicion,
            ),
        ) + 1;

    const idSolicitud =
        Math.max(
            0,
            ...estado.solicitudes.map(
                solicitud =>
                    solicitud.idSolicitud,
            ),
        ) + 1;

    const codigosOrigen = origenes
        .map(requisicion =>
            codigo(requisicion.idRequisicion),
        )
        .join(", ");

    const nueva: Requisicion = {
        idRequisicion,
        fecha: accion.hoy,
        prioridad: resumen.prioridad,
        estado: "Aprobada",
        solicitante: accion.solicitante.trim(),
        observacion:
            `${accion.observacion.trim()}\n` +
            `Origen: ${codigosOrigen}`,
        detalles: resumen.detalles,
    };

    const revision = revisarRequisicion(nueva);

    if (revision.errores.length) {
        return fallo(
            revision.errores.join(" "),
        );
    }

    const solicitud: SolicitudCotizacion = {
        idSolicitud,
        requisicion: idRequisicion,
        fecha: accion.hoy,
        fechaLimite: accion.fechaLimite,
        estado: "Generada",
        proveedoresIds: [],
    };

    const requisicionesActualizadas =
        estado.requisiciones.map(
            (requisicion): Requisicion =>
                ids.has(requisicion.idRequisicion)
                    ? {
                        ...requisicion,
                        estado: "Anulada",
                        observacion:
                            `${requisicion.observacion}\n` +
                            `Anulada por consolidación en ` +
                            `${codigo(idRequisicion)} ` +
                            `(${accion.hoy}).`,
                    }
                    : requisicion,
        );

    return {
        ...estado,
        requisiciones: [
            ...requisicionesActualizadas,
            nueva,
        ],
        solicitudes: [
            ...estado.solicitudes,
            solicitud,
        ],
        mensaje:
            `Consolidación creada: ` +
            `${codigo(idRequisicion)} y ` +
            `COT-${String(idSolicitud).padStart(4, "0")}. ` +
            `Las originales quedaron anuladas por consolidación.`,
        tipoMensaje: "exito",
    };
}