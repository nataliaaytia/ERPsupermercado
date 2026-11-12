//natalia - scrum 528
import { actualizarCompras } from "../requisicionesCotizaciones/almacenCompras";
import { calcularSaldosEntrega } from "../servicioOrdenesCompra/utilidadesSeguimientoEntregas";
import type { OrdenCompra, RecepcionValidada } from "../servicioOrdenesCompra/tipos";
import type {
    DatosCorreccionRecepcion,
    DatosRecepcion,
    RecepcionRegistrada,
} from "./tiposRecepcion";

export function estaEnInspeccion(
    recepcion: RecepcionRegistrada,
    validadas: readonly RecepcionValidada[],
): boolean {
    return (
        (recepcion.estado === "Pendiente de inspección" || recepcion.estado === "En inspección") &&
        !validadas.some(item =>
            item.estado === "Validada" &&
            item.idOrden === recepcion.idOrden &&
            item.idRecepcion === recepcion.idRecepcion,
        )
    );
}

export function calcularDisponibilidadRecepcion(
    orden: OrdenCompra,
    validadas: readonly RecepcionValidada[],
    registradas: readonly RecepcionRegistrada[],
    idExcluir?: number,
) {
    const reservadas = new Map<number, number>();

    for (const recepcion of registradas) {
        if (
            recepcion.idOrden !== orden.idOrden ||
            recepcion.idRecepcion === idExcluir ||
            !estaEnInspeccion(recepcion, validadas)
        ) {
            continue;
        }

        for (const linea of recepcion.detalles) {
            reservadas.set(
                linea.idDetalleOrden,
                (reservadas.get(linea.idDetalleOrden) ?? 0) + linea.cantidadRecibida,
            );
        }
    }

    return calcularSaldosEntrega(orden, validadas).map(linea => {
        const enInspeccion = reservadas.get(linea.idDetalle) ?? 0;

        return {
            ...linea,
            enInspeccion,
            disponible: Math.max(0, linea.pendientes - enInspeccion),
        };
    });
}

export function ordenesDisponiblesParaRecepcion(
    ordenes: readonly OrdenCompra[],
    recepcionesValidadas: readonly RecepcionValidada[],
    recepcionesRegistradas: readonly RecepcionRegistrada[],
) {
    return ordenes
        .filter(orden => orden.estado === "Confirmada")
        .map(orden => ({
            orden,
            lineas: calcularDisponibilidadRecepcion(
                orden,
                recepcionesValidadas,
                recepcionesRegistradas,
            ),
        }))
        .filter(item => item.lineas.some(linea => linea.disponible > 0));
}

function fechaValida(valor: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
    const fecha = new Date(`${valor}T00:00:00Z`);
    return Number.isFinite(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
}

const normalizarDocumento = (valor: string) =>
    valor.trim().replace(/\s+/g, " ").toUpperCase();

function validarCaptura(
    datos: Omit<DatosRecepcion, "idOrden">,
    lineasPermitidas: readonly { idDetalle: number; producto: string; disponible: number }[],
    recepciones: readonly RecepcionRegistrada[],
    idExcluir?: number,
) {
    if (!fechaValida(datos.fecha)) {
        throw new Error("Ingresa una fecha de recepción válida.");
    }

    const documento = normalizarDocumento(datos.documento);

    if (!documento) {
        throw new Error("Ingresa el número de documento de la entrega.");
    }

    if (recepciones.some(item =>
        item.idRecepcion !== idExcluir &&
        normalizarDocumento(item.documento) === documento,
    )) {
        throw new Error("Ya existe una recepción con ese documento.");
    }

    if (datos.detalles.length === 0) {
        throw new Error("Ingresa una cantidad recibida en al menos una línea.");
    }

    const ids = new Set<number>();

    const detalles = datos.detalles.map(item => {
        const linea = lineasPermitidas.find(
            disponible => disponible.idDetalle === item.idDetalleOrden,
        );

        if (!linea || ids.has(item.idDetalleOrden)) {
            throw new Error("Hay una línea repetida o que no está habilitada para esta recepción.");
        }

        const texto = item.cantidad.trim();
        const cantidadRecibida = Number(texto);

        if (!/^\d+$/.test(texto) || !Number.isSafeInteger(cantidadRecibida) || cantidadRecibida <= 0) {
            throw new Error(`Ingresa una cantidad entera mayor que cero para ${linea.producto}.`);
        }

        if (cantidadRecibida > linea.disponible) {
            throw new Error(`La cantidad de ${linea.producto} supera el saldo disponible (${linea.disponible}).`);
        }

        ids.add(item.idDetalleOrden);
        return { idDetalleOrden: item.idDetalleOrden, cantidadRecibida };
    });

    return { fecha: datos.fecha, documento, detalles };
}

export function registrarRecepcion(datos: DatosRecepcion): void {
    actualizarCompras(actual => {
        const seleccion = ordenesDisponiblesParaRecepcion(
            actual.ordenes,
            actual.recepcionesValidadas,
            actual.recepcionesRegistradas,
        ).find(item => item.orden.idOrden === datos.idOrden);

        if (!seleccion) {
            throw new Error("Selecciona una orden confirmada con saldo pendiente.");
        }

        const captura = validarCaptura(datos, seleccion.lineas, actual.recepcionesRegistradas);
        const idRecepcion = [
            ...actual.recepcionesRegistradas,
            ...actual.recepcionesValidadas,
        ].reduce((mayor, item) => Math.max(mayor, item.idRecepcion), 0) + 1;

        const recepcion: RecepcionRegistrada = {
            ...captura,
            idRecepcion,
            idOrden: datos.idOrden,
            estado: "Pendiente de inspección",
        };

        return {
            ...actual,
            recepcionesRegistradas: [...actual.recepcionesRegistradas, recepcion],
        };
    });
}

export function motivoBloqueoRecepcion(
    recepcion: RecepcionRegistrada,
    validadas: readonly RecepcionValidada[],
): string | null {
    if (
        recepcion.estado === "Validada" ||
        validadas.some(item =>
            item.idOrden === recepcion.idOrden &&
            item.idRecepcion === recepcion.idRecepcion,
        )
    ) {
        return "La recepción ya fue validada y no se puede editar.";
    }

    if (recepcion.estado === "En inspección") {
        return "La inspección ya comenzó y la recepción no se puede editar.";
    }

    if (recepcion.estado !== "Pendiente de inspección") {
        return "El estado actual de la recepción no permite editarla.";
    }

    return null;
}

export function corregirRecepcion(
    idRecepcion: number,
    datos: DatosCorreccionRecepcion,
): void {
    actualizarCompras(actual => {
        const recepcion = actual.recepcionesRegistradas.find(item => item.idRecepcion === idRecepcion);

        if (!recepcion) {
            throw new Error("No se encontró la recepción.");
        }

        const bloqueo = motivoBloqueoRecepcion(recepcion, actual.recepcionesValidadas);
        if (bloqueo) throw new Error(bloqueo);
        if (
            actual.inspeccionesCalidad.some(
                inspeccion =>
                    inspeccion.idRecepcion === recepcion.idRecepcion &&
                    inspeccion.idOrden === recepcion.idOrden,
            )
        ) {
            throw new Error(
                "La recepción ya tiene una inspección registrada y no se puede editar.",
            );
        }

        const orden = actual.ordenes.find(item => item.idOrden === recepcion.idOrden);
        if (!orden) throw new Error("No se encontró la orden de la recepción.");

        const responsable = datos.responsable.trim();
        if (!responsable) throw new Error("Ingresa el responsable de la corrección.");

        const captura = validarCaptura(
            datos,
            calcularDisponibilidadRecepcion(
                orden,
                actual.recepcionesValidadas,
                actual.recepcionesRegistradas,
                idRecepcion,
            ),
            actual.recepcionesRegistradas,
            idRecepcion,
        );

        return {
            ...actual,
            recepcionesRegistradas: actual.recepcionesRegistradas.map(item =>
                item.idRecepcion === idRecepcion
                    ? {
                        ...item,
                        ...captura,
                        responsableCorreccion: responsable,
                        fechaCorreccion: new Date().toISOString(),
                    }
                    : item,
            ),
        };
    });
}