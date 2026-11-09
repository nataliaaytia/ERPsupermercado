//NATALIA - SCRUM 523

import type {
    CompromisoEntrega,
    DatosCompromisoEntrega,
    DetalleOrdenCompra,
    OrdenCompra,
} from "./tipos";

import {
    obtenerCompras,
    actualizarCompras,
} from "../requisicionesCotizaciones/almacenCompras";

export function fechaHoy(): string {
    const fecha = new Date();

    return [
        fecha.getFullYear(),
        String(fecha.getMonth() + 1).padStart(2, "0"),
        String(fecha.getDate()).padStart(2, "0"),
    ].join("-");
}

function fechaValida(valor: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;

    const fecha = new Date(`${valor}T00:00:00.000Z`);

    return (
        Number.isFinite(fecha.getTime()) &&
        fecha.toISOString().slice(0, 10) === valor
    );
}

function esObjeto(
    valor: unknown,
): valor is Record<string, unknown> {
    return (
        typeof valor === "object" &&
        valor !== null &&
        !Array.isArray(valor)
    );
}

function esCompromiso(
    valor: unknown,
): valor is CompromisoEntrega {
    return (
        esObjeto(valor) &&
        Number.isSafeInteger(valor.idCompromiso) &&
        Number(valor.idCompromiso) > 0 &&
        typeof valor.fechaEntrega === "string" &&
        fechaValida(valor.fechaEntrega) &&
        Number.isSafeInteger(valor.cantidad) &&
        Number(valor.cantidad) > 0 &&
        typeof valor.estado === "string" &&
        typeof valor.observacion === "string"
    );
}

function esDetalle(
    valor: unknown,
): valor is DetalleOrdenCompra {
    return (
        esObjeto(valor) &&
        Number.isSafeInteger(valor.idDetalle) &&
        Number(valor.idDetalle) > 0 &&
        esObjeto(valor.producto) &&
        Number.isSafeInteger(valor.producto.idProducto) &&
        Number(valor.producto.idProducto) > 0 &&
        typeof valor.producto.descripcion === "string" &&
        Number.isSafeInteger(valor.cantidad) &&
        Number(valor.cantidad) > 0 &&
        typeof valor.precio === "number" &&
        Number.isFinite(valor.precio) &&
        typeof valor.subtotal === "number" &&
        Number.isFinite(valor.subtotal) &&
        (
            valor.compromisos === undefined ||
            (
                Array.isArray(valor.compromisos) &&
                valor.compromisos.every(esCompromiso)
            )
        )
    );
}

function esOrden(valor: unknown): valor is OrdenCompra {
    if (!esObjeto(valor) || !Array.isArray(valor.detalles)) {
        return false;
    }

    return (
        Number.isSafeInteger(valor.idOrden) &&
        Number(valor.idOrden) > 0 &&
        typeof valor.numero === "string" &&
        typeof valor.fecha === "string" &&
        fechaValida(valor.fecha) &&
        typeof valor.estado === "string" &&
        typeof valor.total === "number" &&
        Number.isFinite(valor.total) &&
        typeof valor.observacion === "string" &&
        valor.detalles.every(esDetalle) &&
        new Set(
            valor.detalles.map(detalle => detalle.idDetalle),
        ).size === valor.detalles.length
    );
}

export function cargarOrdenesCompra(): OrdenCompra[] {
    const estado = obtenerCompras();

    if (estado.errorCarga) {
        throw new Error(estado.errorCarga);
    }

    const datos = estado.ordenes;

    if (
        !datos.every(esOrden) ||
        new Set(datos.map(orden => orden.idOrden)).size !== datos.length
    ) {
        throw new Error(
            "Los datos guardados de órdenes de compra no son válidos.",
        );
    }

    return datos;
}

export function guardarOrdenesCompra(
    ordenes: OrdenCompra[],
): void {
    if (
        !ordenes.every(esOrden) ||
        new Set(ordenes.map(orden => orden.idOrden)).size !== ordenes.length
    ) {
        throw new Error(
            "Los datos de las órdenes de compra no son válidos.",
        );
    }

    actualizarCompras(actual =>
        actual.ordenes === ordenes
            ? actual
            : { ...actual, ordenes },
    );
}

export function cantidadComprometida(
    detalle: DetalleOrdenCompra,
): number {
    return (detalle.compromisos ?? []).reduce(
        (total, compromiso) => total + compromiso.cantidad,
        0,
    );
}

export function agregarCompromiso(
    ordenes: OrdenCompra[],
    datos: DatosCompromisoEntrega,
    hoy: string,
): OrdenCompra[] {
    const orden = ordenes.find(
        item => item.idOrden === datos.idOrden,
    );

    if (!orden || orden.estado !== "Confirmada") {
        throw new Error(
            "Solo puedes registrar entregas en una orden confirmada.",
        );
    }

    const detalle = orden.detalles.find(
        item => item.idDetalle === datos.idDetalle,
    );

    if (!detalle) {
        throw new Error("Selecciona una línea de la orden.");
    }

    if (
        !fechaValida(datos.fechaEntrega) ||
        !fechaValida(hoy) ||
        datos.fechaEntrega < hoy ||
        datos.fechaEntrega < orden.fecha
    ) {
        throw new Error(
            "La fecha debe ser válida y no anterior a hoy ni a la fecha de la orden.",
        );
    }

    if (!/^\d+$/.test(datos.cantidad.trim())) {
        throw new Error(
            "La cantidad debe ser un número entero mayor que cero.",
        );
    }

    const cantidad = Number(datos.cantidad);

    if (!Number.isSafeInteger(cantidad) || cantidad <= 0) {
        throw new Error(
            "La cantidad debe ser un número entero mayor que cero.",
        );
    }

    const acumulado = cantidadComprometida(detalle);

    if (
        !Number.isSafeInteger(acumulado) ||
        cantidad > detalle.cantidad - acumulado
    ) {
        throw new Error(
            `La cantidad supera el saldo de la línea: ${Math.max(
                0,
                detalle.cantidad - acumulado,
            )}.`,
        );
    }

    const ids = ordenes.flatMap(item =>
        item.detalles.flatMap(linea =>
            (linea.compromisos ?? []).map(
                compromiso => compromiso.idCompromiso,
            ),
        ),
    );

    const idCompromiso =
        ids.reduce((maximo, id) => Math.max(maximo, id), 0) + 1;

    if (!Number.isSafeInteger(idCompromiso)) {
        throw new Error(
            "No se pudo asignar el identificador del compromiso.",
        );
    }

    const compromiso: CompromisoEntrega = {
        idCompromiso,
        fechaEntrega: datos.fechaEntrega,
        cantidad,
        estado: "Pendiente",
        observacion: datos.observacion.trim(),
    };

    return ordenes.map(item =>
        item.idOrden !== orden.idOrden
            ? item
            : {
                ...item,
                detalles: item.detalles.map(linea =>
                    linea.idDetalle !== detalle.idDetalle
                        ? linea
                        : {
                            ...linea,
                            compromisos: [
                                ...(linea.compromisos ?? []),
                                compromiso,
                            ],
                        },
                ),
            },
    );
}

export function registrarCompromiso(
    datos: DatosCompromisoEntrega,
): OrdenCompra[] {
    const ordenes = agregarCompromiso(
        cargarOrdenesCompra(),
        datos,
        fechaHoy(),
    );

    guardarOrdenesCompra(ordenes);

    return ordenes;
}