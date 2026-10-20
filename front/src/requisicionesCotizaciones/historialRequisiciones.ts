import { reducirCompras } from "./modeloCompras";

import type {
    AccionCompras,
    EstadoCompras,
} from "./modeloCompras";

import type {
    CambioHistorialRequisicion,
    RegistroHistorialRequisicion,
    Requisicion,
} from "./tipos";

export interface AccionConHistorial {
    accion: AccionCompras;
    fecha: string;
}

const codigoSolicitud = (id: number) =>
    `COT-${String(id).padStart(4, "0")}`;

const nombres: Partial<
    Record<AccionCompras["tipo"], string>
> = {
    crear: "Registro de requisición",
    modificar: "Edición de requisición",
    cambiarPrioridad: "Cambio de prioridad",
    aprobar: "Aprobación",
    anular: "Anulación",
    consolidar: "Consolidación",
    generar: "Generación de cotización",
    enviar: "Envío de cotización",
    cancelar: "Cancelación de cotización",
    cancelarRequisicion: "Cancelación de requisición",
};

function compararRequisiciones(
    anterior: Requisicion | undefined,
    actual: Requisicion,
): CambioHistorialRequisicion[] {
    const cambios: CambioHistorialRequisicion[] = [];

    const agregar = (
        campo: string,
        antes: string,
        despues: string,
    ) => {
        if (antes !== despues) {
            cambios.push({
                campo,
                anterior: antes,
                actual: despues,
            });
        }
    };

    agregar(
        "Estado",
        anterior?.estado ?? "Sin registro",
        actual.estado,
    );

    agregar(
        "Prioridad",
        anterior?.prioridad ?? "",
        actual.prioridad,
    );

    agregar(
        "Solicitante",
        anterior?.solicitante ?? "",
        actual.solicitante,
    );

    agregar(
        "Observación",
        anterior?.observacion ?? "",
        actual.observacion,
    );

    const antes = new Map(
        (anterior?.detalles ?? []).map(
            detalle => [
                detalle.idDetalle,
                detalle,
            ],
        ),
    );

    const despues = new Map(
        actual.detalles.map(
            detalle => [
                detalle.idDetalle,
                detalle,
            ],
        ),
    );

    const ids = new Set([
        ...antes.keys(),
        ...despues.keys(),
    ]);

    for (const id of ids) {
        const previo = antes.get(id);
        const nuevo = despues.get(id);

        const etiqueta = `Detalle ${id}`;

        agregar(
            `${etiqueta}: producto`,
            previo
                ? `${previo.producto.descripcion} [${previo.producto.idProducto}]`
                : "",
            nuevo
                ? `${nuevo.producto.descripcion} [${nuevo.producto.idProducto}]`
                : "",
        );

        agregar(
            `${etiqueta}: cantidad`,
            previo ? String(previo.cantidad) : "",
            nuevo ? String(nuevo.cantidad) : "",
        );

        agregar(
            `${etiqueta}: observación`,
            previo?.observacion ?? "",
            nuevo?.observacion ?? "",
        );
    }

    return cambios;
}

function compararSolicitudes(
    anterior: EstadoCompras,
    actual: EstadoCompras,
    idRequisicion: number,
): CambioHistorialRequisicion[] {
    const cambios: CambioHistorialRequisicion[] = [];

    const antes = new Map(
        anterior.solicitudes
            .filter(
                solicitud =>
                    solicitud.requisicion === idRequisicion,
            )
            .map(
                solicitud => [
                    solicitud.idSolicitud,
                    solicitud,
                ],
            ),
    );

    const despues = new Map(
        actual.solicitudes
            .filter(
                solicitud =>
                    solicitud.requisicion === idRequisicion,
            )
            .map(
                solicitud => [
                    solicitud.idSolicitud,
                    solicitud,
                ],
            ),
    );

    const ids = new Set([
        ...antes.keys(),
        ...despues.keys(),
    ]);

    for (const id of ids) {
        const previo = antes.get(id);
        const nuevo = despues.get(id);

        const campos = [
            {
                campo: "estado",
                anterior: previo?.estado ?? "Sin generar",
                actual: nuevo?.estado ?? "Sin registro",
            },
            {
                campo: "fecha límite",
                anterior: previo?.fechaLimite ?? "",
                actual: nuevo?.fechaLimite ?? "",
            },
            {
                campo: "proveedores invitados",
                anterior: [
                    ...(previo?.proveedoresIds ?? []),
                ]
                    .sort((a, b) => a - b)
                    .join(", "),
                actual: [
                    ...(nuevo?.proveedoresIds ?? []),
                ]
                    .sort((a, b) => a - b)
                    .join(", "),
            },
        ];

        for (const campo of campos) {
            if (campo.anterior !== campo.actual) {
                cambios.push({
                    ...campo,
                    campo:
                        `${codigoSolicitud(id)}: ` +
                        campo.campo,
                });
            }
        }
    }

    return cambios;
}

export function reducirComprasConHistorial(
    estado: EstadoCompras,
    evento: AccionConHistorial,
): EstadoCompras {
    const resultado = reducirCompras(
        estado,
        evento.accion,
    );

    const requisiciones =
        resultado.requisiciones.map(actual => {
            const anterior =
                estado.requisiciones.find(
                    requisicion =>
                        requisicion.idRequisicion ===
                        actual.idRequisicion,
                );

            const cambios = [
                ...compararRequisiciones(
                    anterior,
                    actual,
                ),
                ...compararSolicitudes(
                    estado,
                    resultado,
                    actual.idRequisicion,
                ),
            ];

            if (cambios.length === 0) {
                return actual;
            }

            const historial =
                anterior?.historial ?? [];

            const registro: RegistroHistorialRequisicion = {
                idRegistro:
                    Math.max(
                        0,
                        ...historial.map(
                            registro =>
                                registro.idRegistro,
                        ),
                    ) + 1,
                fecha: evento.fecha,
                accion:
                    nombres[evento.accion.tipo] ??
                    "Actualización",
                cambios,
            };

            return {
                ...actual,
                historial: [
                    ...historial,
                    registro,
                ],
            };
        });

    return {
        ...resultado,
        requisiciones,
    };
}