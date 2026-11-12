export interface LineaOrdenConciliable {
    idDetalle: number;
    cantidad: number;
    producto: {
        descripcion: string;
    };
}

export interface OrdenConciliable {
    idOrden: number;
    numero: string;
    detalles: LineaOrdenConciliable[];
}

function esObjeto(
    valor: unknown,
): valor is Record<string, unknown> {
    return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function validarOrden(
    valor: unknown,
    idOrdenEsperado: number,
): OrdenConciliable {
    if (
        !esObjeto(valor) ||
        valor.idOrden !== idOrdenEsperado ||
        typeof valor.numero !== "string" ||
        !Array.isArray(valor.detalles)
    ) {
        throw new Error(
            "La API devolvió una orden inválida o distinta a la solicitada.",
        );
    }

    const detalles = valor.detalles.map((detalle): LineaOrdenConciliable => {
        if (
            !esObjeto(detalle) ||
            !Number.isSafeInteger(detalle.idDetalle) ||
            !Number.isSafeInteger(detalle.cantidad) ||
            Number(detalle.cantidad) < 0 ||
            !esObjeto(detalle.producto) ||
            typeof detalle.producto.descripcion !== "string"
        ) {
            throw new Error(
                "La API devolvió una línea de orden con datos inválidos.",
            );
        }

        return {
            idDetalle: Number(detalle.idDetalle),
            cantidad: Number(detalle.cantidad),
            producto: {
                descripcion: detalle.producto.descripcion,
            },
        };
    });

    if (new Set(detalles.map(detalle => detalle.idDetalle)).size !== detalles.length) {
        throw new Error("La API devolvió líneas duplicadas para la orden.");
    }

    return {
        idOrden: idOrdenEsperado,
        numero: valor.numero,
        detalles,
    };
}

export async function consultarOrdenParaConciliacion(
    idOrden: number,
): Promise<OrdenConciliable> {
    if (!Number.isSafeInteger(idOrden) || idOrden <= 0) {
        throw new Error("El identificador de la orden no es válido.");
    }

    const base = import.meta.env.VITE_ORDEN_COMPRA_API?.trim();
    if (!base) {
        throw new Error(
            "La consulta de órdenes aún no está configurada. Define VITE_ORDEN_COMPRA_API con la ruta base de la API de órdenes.",
        );
    }

    let respuesta: Response;
    try {
        respuesta = await fetch(
            `${base.replace(/\/+$/, "")}/${encodeURIComponent(idOrden)}`,
            {
                headers: { Accept: "application/json" },
            },
        );
    } catch (fallo) {
        throw new Error(
            fallo instanceof Error
                ? `No se pudo consultar la orden en Backend: ${fallo.message}`
                : "No se pudo consultar la orden en Backend.",
            { cause: fallo },
        );
    }

    if (!respuesta.ok) {
        throw new Error(
            respuesta.status === 404
                ? `Backend no encontró la orden ${idOrden}.`
                : `La API de órdenes respondió HTTP ${respuesta.status}.`,
        );
    }

    let datos: unknown;
    try {
        datos = await respuesta.json();
    } catch (fallo) {
        throw new Error("La API de órdenes no devolvió JSON válido.", {
            cause: fallo,
        });
    }

    return validarOrden(datos, idOrden);
}
