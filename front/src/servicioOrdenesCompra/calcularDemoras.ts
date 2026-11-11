//natalia: scrum 526

import type { OfertaProveedor } from "../requisicionesCotizaciones/tipos";
import { calcularSaldosEntrega } from "./utilidadesSeguimientoEntregas";
import type { OrdenCompra, RecepcionValidada } from "./tipos";

export interface DemoraEntrega {
    idOrden: number;
    numeroOrden: string;
    idDetalle: number;
    idCompromiso: number;
    proveedor: string;
    producto: string;
    fechaEntrega: string;
    cantidadPendiente: number;
}

export function calcularDemoras(
    ordenes: readonly OrdenCompra[],
    ofertas: readonly OfertaProveedor[],
    recepciones: readonly RecepcionValidada[],
    hoy: string,
): DemoraEntrega[] {
    const proveedorPorOferta = new Map(
        ofertas.map(oferta => [oferta.idOferta, oferta.proveedor.razonSocial]),
    );

    const demoras: DemoraEntrega[] = [];

    for (const orden of ordenes) {
        if (orden.estado !== "Confirmada") continue;

        const saldos = new Map(
            calcularSaldosEntrega(orden, recepciones).map(
                saldo => [saldo.idDetalle, saldo],
            ),
        );

        const proveedor =
            proveedorPorOferta.get(orden.idOfertaOrigen ?? 0) ??
            "Proveedor no identificado";

        for (const linea of orden.detalles) {
            const saldo = saldos.get(linea.idDetalle);

            if (!saldo || saldo.pendientes === 0) continue;

            let aceptadasPorAplicar = saldo.aceptadas;

            const compromisos = (linea.compromisos ?? [])
                .filter(compromiso => {
                    const estado = compromiso.estado.trim().toLowerCase();
                    return estado !== "anulado" && estado !== "cancelado";
                })
                .sort((a, b) =>
                    a.fechaEntrega.localeCompare(b.fechaEntrega) ||
                    a.idCompromiso - b.idCompromiso,
                );

            for (const compromiso of compromisos) {
                const aceptadas = Math.min(
                    aceptadasPorAplicar,
                    compromiso.cantidad,
                );

                aceptadasPorAplicar -= aceptadas;

                const cantidadPendiente = compromiso.cantidad - aceptadas;

                if (compromiso.fechaEntrega >= hoy || cantidadPendiente <= 0) {
                    continue;
                }

                demoras.push({
                    idOrden: orden.idOrden,
                    numeroOrden: orden.numero,
                    idDetalle: linea.idDetalle,
                    idCompromiso: compromiso.idCompromiso,
                    proveedor,
                    producto: linea.producto.descripcion,
                    fechaEntrega: compromiso.fechaEntrega,
                    cantidadPendiente,
                });
            }
        }
    }

    return demoras.sort((a, b) =>
        a.fechaEntrega.localeCompare(b.fechaEntrega) ||
        a.idOrden - b.idOrden ||
        a.idDetalle - b.idDetalle ||
        a.idCompromiso - b.idCompromiso,
    );
}