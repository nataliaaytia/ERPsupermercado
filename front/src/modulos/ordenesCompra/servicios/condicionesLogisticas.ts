//NATALIA - SCRUM 524

import {
    cargarOrdenesCompra,
    guardarOrdenesCompra,
} from "./compromisosEntrega";
import { obtenerCompras } from "../../../estado/almacenCompras";
import { conexion } from "../../../servicios/api/configuracion";
import * as api from "./ordenesApi";
import { finalizarOperacion } from "./operacionApi";
import type {
    CondicionesLogisticas,
    OrdenCompra,
} from "../tipos";

export function puedeEditarLogistica(
    orden: OrdenCompra,
): boolean {
    const estado = orden.estado.trim().toLowerCase();

    return estado !== "cerrada" && estado !== "anulada";
}

export async function guardarCondicionesLogisticas(
    idOrden: number,
    datos: CondicionesLogisticas,
): Promise<OrdenCompra[]> {
    const ordenes = cargarOrdenesCompra();

    const orden = ordenes.find(
        item => item.idOrden === idOrden,
    );

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

    if (conexion.ordenes) {
        await api.guardarCondiciones(idOrden, condicionesLogisticas);
        await finalizarOperacion(
            `Condiciones logísticas de ${orden.numero} guardadas.`,
        );
        return obtenerCompras().ordenes;
    }

    const actualizadas = ordenes.map(item =>
        item.idOrden === idOrden
            ? { ...item, condicionesLogisticas }
            : item,
    );

    guardarOrdenesCompra(actualizadas);

    return actualizadas;
}