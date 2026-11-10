import { actualizarCompras } from "../requisicionesCotizaciones/almacenCompras";
import { motivoBloqueoRecepcion } from "./registroRecepcion";
import type { CostoTransporte } from "./tiposRecepcion";

export interface DatosCostoTransporte {
    importe: string;
    concepto: string;
    comprobante: string;
}

function convertirACentavos(valor: string): number {
    const texto = valor.trim();

    if (!/^\d+(?:[.,]\d{1,2})?$/.test(texto)) {
        throw new Error(
            "Ingresa un importe de cero o más, con hasta dos decimales.",
        );
    }

    const [entero, decimal = ""] = texto.replace(",", ".").split(".");
    const centavos = Number(entero + decimal.padEnd(2, "0"));

    if (!Number.isSafeInteger(centavos)) {
        throw new Error("El importe es demasiado grande.");
    }

    return centavos;
}

export function guardarCostoTransporte(
    idRecepcion: number,
    datos: DatosCostoTransporte,
): void {
    actualizarCompras(actual => {
        const recepcion = actual.recepcionesRegistradas.find(
            item => item.idRecepcion === idRecepcion,
        );

        if (!recepcion) {
            throw new Error("No se encontró la recepción.");
        }

        const bloqueo = motivoBloqueoRecepcion(
            recepcion,
            actual.recepcionesValidadas,
        );

        if (bloqueo) throw new Error(bloqueo);

        const importeCentavos = convertirACentavos(datos.importe);
        const concepto = datos.concepto.trim();
        const comprobante = datos.comprobante.trim();

        if (!concepto || !comprobante) {
            throw new Error(
                "Completa el concepto y la referencia del comprobante.",
            );
        }

        const costoTransporte: CostoTransporte = {
            importeCentavos,
            concepto,
            comprobante,
        };

        return {
            ...actual,
            recepcionesRegistradas: actual.recepcionesRegistradas.map(item =>
                item.idRecepcion === idRecepcion
                    ? { ...item, costoTransporte }
                    : item,
            ),
        };
    });
}