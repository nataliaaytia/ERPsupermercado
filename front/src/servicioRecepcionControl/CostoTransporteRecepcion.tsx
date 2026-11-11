import { useState } from "react";
import type { FormEvent } from "react";
import type { RecepcionValidada } from "../servicioOrdenesCompra/tipos";
import { motivoBloqueoRecepcion } from "./registroRecepcion";
import { guardarCostoTransporte } from "./registroCostoTransporte";
import type { RecepcionRegistrada } from "./tiposRecepcion";

interface Props {
    recepcion: RecepcionRegistrada;
    recepcionesValidadas: readonly RecepcionValidada[];
}

function formatearImporte(centavos: number): string {
    const digitos = String(centavos).padStart(3, "0");
    return `${digitos.slice(0, -2)}.${digitos.slice(-2)}`;
}

export default function CostoTransporteRecepcion({
    recepcion,
    recepcionesValidadas,
}: Props) {
    const [editando, setEditando] = useState(false);
    const [importe, setImporte] = useState("");
    const [concepto, setConcepto] = useState("");
    const [comprobante, setComprobante] = useState("");
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const costo = recepcion.costoTransporte;
    const bloqueo = motivoBloqueoRecepcion(recepcion, recepcionesValidadas);

    function abrir() {
        setImporte(costo ? formatearImporte(costo.importeCentavos) : "");
        setConcepto(costo?.concepto ?? "");
        setComprobante(costo?.comprobante ?? "");
        setError("");
        setMensaje("");
        setEditando(true);
    }

    function guardar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();

        if (bloqueo) return;

        setError("");
        setMensaje("");

        try {
            guardarCostoTransporte(recepcion.idRecepcion, {
                importe,
                concepto,
                comprobante,
            });

            setEditando(false);
            setMensaje("Costo de transporte guardado.");
        } catch (fallo) {
            setError(
                fallo instanceof Error ? fallo.message : "No se pudo guardar el costo.",
            );
        }
    }

    return (
        <section className="ordenes-compra__tarjeta">
            <h2>Costo de transporte</h2>

            {costo ? (
                <div>
                    <p>
                        <strong>Importe:</strong> Bs {formatearImporte(costo.importeCentavos)}
                    </p>
                    <p><strong>Concepto:</strong> {costo.concepto}</p>
                    <p><strong>Comprobante:</strong> {costo.comprobante}</p>
                </div>
            ) : (
                <p>Todavía no se registró un costo de transporte.</p>
            )}

            {mensaje && (
                <p className="ordenes-compra__exito" role="status">{mensaje}</p>
            )}

            {bloqueo ? (
                <p>El costo de transporte está disponible solo para consulta.</p>
            ) : editando ? (
                <form className="ordenes-compra__tarjeta" onSubmit={guardar} noValidate>
                    <label className="ordenes-compra__campo">
                        Importe en bolivianos
                        <input
                            inputMode="decimal"
                            value={importe}
                            onChange={evento => setImporte(evento.target.value)}
                            placeholder="Ej. 150,50"
                            required
                        />
                    </label>

                    <label className="ordenes-compra__campo">
                        Concepto
                        <input
                            value={concepto}
                            onChange={evento => setConcepto(evento.target.value)}
                            placeholder="Ej. Flete al almacén central"
                            required
                        />
                    </label>

                    <label className="ordenes-compra__campo">
                        Referencia del comprobante
                        <input
                            value={comprobante}
                            onChange={evento => setComprobante(evento.target.value)}
                            placeholder="Ej. FACT-017"
                            required
                        />
                    </label>

                    {error && (
                        <p className="ordenes-compra__error" role="alert">{error}</p>
                    )}

                    <div className="ordenes-compra__resumen">
                        <button type="submit">Guardar costo</button>
                        <button type="button" onClick={() => setEditando(false)}>
                            Cancelar
                        </button>
                    </div>
                </form>
            ) : (
                <button type="button" onClick={abrir}>
                    {costo ? "Editar costo de transporte" : "Registrar costo de transporte"}
                </button>
            )}
        </section>
    );
}