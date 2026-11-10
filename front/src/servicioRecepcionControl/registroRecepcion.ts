//natalia - scrum 528

import { actualizarCompras } from "../requisicionesCotizaciones/almacenCompras";
import { calcularSaldosEntrega } from "../servicioOrdenesCompra/utilidadesSeguimientoEntregas";
import type { OrdenCompra, RecepcionValidada } from "../servicioOrdenesCompra/tipos";
import type { DatosRecepcion, RecepcionRegistrada } from "./tiposRecepcion";

export function ordenesDisponiblesParaRecepcion(
    ordenes: readonly OrdenCompra[],
    recepcionesValidadas: readonly RecepcionValidada[],
) {
    return ordenes
        .filter(orden => orden.estado === "Confirmada")
        .map(orden => ({
            orden,
            lineas: calcularSaldosEntrega(orden, recepcionesValidadas)
                .filter(linea => linea.pendientes > 0),
        }))
        .filter(item => item.lineas.length > 0);
}

function fechaValida(valor: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;

    const fecha = new Date(`${valor}T00:00:00Z`);

    return (
        Number.isFinite(fecha.getTime()) &&
        fecha.toISOString().slice(0, 10) === valor
    );
}

const normalizarDocumento = (valor: string) =>
    valor.trim().replace(/\s+/g, " ").toUpperCase();

export function registrarRecepcion(datos: DatosRecepcion): void {
    actualizarCompras(actual => {
        const seleccion = ordenesDisponiblesParaRecepcion(
            actual.ordenes,
            actual.recepcionesValidadas,
        ).find(item => item.orden.idOrden === datos.idOrden);

        if (!seleccion) {
            throw new Error("Selecciona una orden confirmada con saldo pendiente.");
        }

        if (!fechaValida(datos.fecha)) {
            throw new Error("Ingresa una fecha de recepción válida.");
        }

        const documento = normalizarDocumento(datos.documento);

        if (!documento) {
            throw new Error("Ingresa el número de documento de la entrega.");
        }

        if (
            actual.recepcionesRegistradas.some(
                item => normalizarDocumento(item.documento) === documento,
            )
        ) {
            throw new Error("Ya existe una recepción con ese documento.");
        }

        if (datos.detalles.length === 0) {
            throw new Error("Ingresa una cantidad recibida en al menos una línea.");
        }

        const idsRegistrados = new Set<number>();

        const detalles = datos.detalles.map(item => {
            const linea = seleccion.lineas.find(
                saldo => saldo.idDetalle === item.idDetalleOrden,
            );

            if (!linea || idsRegistrados.has(item.idDetalleOrden)) {
                throw new Error(
                    "La recepción tiene una línea repetida o que no pertenece al saldo de la orden.",
                );
            }

            const texto = item.cantidad.trim();
            const cantidadRecibida = Number(texto);

            if (
                !/^\d+$/.test(texto) ||
                !Number.isSafeInteger(cantidadRecibida) ||
                cantidadRecibida <= 0
            ) {
                throw new Error(
                    `Ingresa una cantidad entera mayor que cero para ${linea.producto}.`,
                );
            }

            idsRegistrados.add(item.idDetalleOrden);

            return {
                idDetalleOrden: item.idDetalleOrden,
                cantidadRecibida,
            };
        });

        const idRecepcion = [
            ...actual.recepcionesRegistradas,
            ...actual.recepcionesValidadas,
        ].reduce((mayor, item) => Math.max(mayor, item.idRecepcion), 0) + 1;

        const recepcion: RecepcionRegistrada = {
            idRecepcion,
            idOrden: datos.idOrden,
            fecha: datos.fecha,
            documento,
            estado: "Pendiente de inspección",
            detalles,
        };

        return {
            ...actual,
            recepcionesRegistradas: [...actual.recepcionesRegistradas, recepcion],
        };
    });
}