//NATALIA - SCRUM 524

import {
    cargarOrdenesCompra,
    CLAVE_ORDENES_COMPRA,
} from "./compromisosEntrega";
import type { CondicionesLogisticas, OrdenCompra } from "./tipos";

export function puedeEditarLogistica(orden: OrdenCompra): boolean {
    const estado = orden.estado.trim().toLowerCase();
    return estado !== "cerrada" && estado !== "anulada";
}

export function guardarCondicionesLogisticas(
    idOrden: number,
    datos: CondicionesLogisticas,
): OrdenCompra[] {
    const ordenes = cargarOrdenesCompra();
    const orden = ordenes.find(item => item.idOrden === idOrden);

    if (!orden) {
        throw new Error("La orden ya no está disponible.");
    }

    if (!puedeEditarLogistica(orden)) {
        throw new Error(
            "No se pueden cambiar las condiciones de una orden cerrada o anulada.",
        );
    }

    const condicionesLogisticas: CondicionesLogisticas = {
        destino: datos.destino.trim(),
        horario: datos.horario.trim(),
        responsableEntrega: datos.responsableEntrega.trim(),
    };

    if (
        !condicionesLogisticas.destino ||
        !condicionesLogisticas.horario ||
        !condicionesLogisticas.responsableEntrega
    ) {
        throw new Error(
            "Completa el destino, el horario y el responsable de entrega.",
        );
    }

    const actualizadas = ordenes.map(item =>
        item.idOrden === idOrden
            ? { ...item, condicionesLogisticas }
            : item,
    );

    localStorage.setItem(
        CLAVE_ORDENES_COMPRA,
        JSON.stringify(actualizadas),
    );

    return actualizadas;
}