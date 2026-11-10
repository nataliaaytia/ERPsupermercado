import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRequisiciones } from "../requisicionesCotizaciones/useRequisiciones";
import type { DetalleOrdenCompra, OrdenCompra } from "./tipos";
import {
    cargarOrdenesCompra,
    guardarOrdenesCompra,
    fechaHoy,
} from "./compromisosEntrega";
import "./GenerarOrdenCompra.css";

function redondear(valor: number): number {
    return Number(valor.toFixed(2));
}

function calcularDetalles(
    oferta: ReturnType<typeof useRequisiciones>["ofertas"][number],
    requisicion: ReturnType<typeof useRequisiciones>["requisiciones"][number],
): DetalleOrdenCompra[] {
    if (requisicion.detalles.length === 0) {
        throw new Error("La requisición no contiene productos.");
    }

    const descuento = oferta.descuento ?? 0;

    if (
        !Number.isFinite(descuento) ||
        descuento < 0 ||
        descuento > 100
    ) {
        throw new Error("El descuento de la oferta no es válido.");
    }

    return requisicion.detalles.map((linea, indice) => {
        const cotizado = oferta.detalles.find(
            detalle =>
                detalle.producto.idProducto === linea.producto.idProducto,
        );

        if (
            !cotizado ||
            !Number.isFinite(cotizado.precio) ||
            cotizado.precio <= 0 ||
            !Number.isSafeInteger(linea.cantidad) ||
            linea.cantidad <= 0
        ) {
            throw new Error(
                `Revisa el precio y la cantidad de ${linea.producto.descripcion}.`,
            );
        }

        return {
            idDetalle: indice + 1,
            producto: linea.producto,
            cantidad: linea.cantidad,
            precio: cotizado.precio,
            subtotal: redondear(
                linea.cantidad * cotizado.precio * (1 - descuento / 100),
            ),
        };
    });
}

interface GenerarOrdenCompraProps {
    onOrdenCreada?: (orden: OrdenCompra) => void;
}

export default function GenerarOrdenCompra({
    onOrdenCreada,
}: GenerarOrdenCompraProps) {
    const { ofertas, solicitudes, requisiciones, ordenes, errorCarga } =
        useRequisiciones();

    const [idOferta, setIdOferta] = useState("");
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [guardando, setGuardando] = useState(false);

    const ofertasDisponibles = useMemo(
        () =>
            ofertas.filter(
                oferta =>
                    oferta.estado === "Seleccionada" &&
                    !ordenes.some(
                        orden => orden.idOfertaOrigen === oferta.idOferta,
                    ),
            ),
        [ofertas, ordenes],
    );

    const oferta = ofertasDisponibles.find(
        item => item.idOferta === Number(idOferta),
    );

    const solicitud = solicitudes.find(
        item => item.idSolicitud === oferta?.solicitud,
    );

    const requisicion = requisiciones.find(
        item => item.idRequisicion === solicitud?.requisicion,
    );

    const vistaPrevia = useMemo(() => {
        if (!oferta || !requisicion) {
            return { detalles: [] as DetalleOrdenCompra[], error: "" };
        }

        try {
            return {
                detalles: calcularDetalles(oferta, requisicion),
                error: "",
            };
        } catch (fallo) {
            return {
                detalles: [] as DetalleOrdenCompra[],
                error:
                    fallo instanceof Error
                        ? fallo.message
                        : "No se pudo calcular la orden.",
            };
        }
    }, [oferta, requisicion]);

    const total = redondear(
        vistaPrevia.detalles.reduce(
            (acumulado, detalle) => acumulado + detalle.subtotal,
            0,
        ),
    );

    const moneda = (valor: number) =>
        valor.toLocaleString("es-BO", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    function cambiarOferta(valor: string) {
        setIdOferta(valor);
        setError("");
        setMensaje("");
    }

    function generarOrden(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        setError("");
        setMensaje("");

        if (guardando) return;

        if (!oferta || !solicitud || !requisicion) {
            setError("Selecciona una oferta adjudicada válida.");
            return;
        }

        if (vistaPrevia.error || vistaPrevia.detalles.length === 0) {
            setError(vistaPrevia.error || "La oferta no contiene productos válidos.");
            return;
        }

        setGuardando(true);

        try {
            // Volvemos a consultar el estado antes de guardar.
            const actuales = cargarOrdenesCompra();

            if (
                actuales.some(
                    orden => orden.idOfertaOrigen === oferta.idOferta,
                )
            ) {
                throw new Error(
                    "Ya existe una orden de compra para esta oferta.",
                );
            }

            const idOrden =
                actuales.reduce(
                    (maximo, orden) => Math.max(maximo, orden.idOrden),
                    0,
                ) + 1;

            if (!Number.isSafeInteger(idOrden)) {
                throw new Error("No se pudo generar el identificador de la orden.");
            }

            const nuevaOrden: OrdenCompra = {
                idOrden,
                idOfertaOrigen: oferta.idOferta,
                numero: `OC-${String(idOrden).padStart(4, "0")}`,
                fecha: fechaHoy(),
                estado: "Borrador",
                total,
                observacion: requisicion.observacion,
                detalles: vistaPrevia.detalles,
            };

            guardarOrdenesCompra([...actuales, nuevaOrden]);

            setMensaje(
                `La orden ${nuevaOrden.numero} se creó correctamente como borrador.`,
            );
            setIdOferta("");
            onOrdenCreada?.(nuevaOrden);
        } catch (fallo) {
            setError(
                fallo instanceof Error
                    ? fallo.message
                    : "No se pudo generar la orden de compra.",
            );
        } finally {
            setGuardando(false);
        }
    }

    return (
        <section className="generar-orden">
            <form
                className="generar-orden__formulario"
                onSubmit={generarOrden}
            >
                <div className="generar-orden__encabezado">
                    <h2>Generar orden de compra</h2>
                    <p>
                        Selecciona una oferta adjudicada para generar
                        una orden en borrador.
                    </p>
                </div>

                {errorCarga && (
                    <p className="generar-orden__error" role="alert">
                        {errorCarga}
                    </p>
                )}

                <label className="generar-orden__campo">
                    Oferta adjudicada
                    <select
                        value={idOferta}
                        onChange={evento => cambiarOferta(evento.target.value)}
                        disabled={Boolean(errorCarga)}
                        required
                    >
                        <option value="">Selecciona una oferta</option>
                        {ofertasDisponibles.map(item => (
                            <option
                                key={item.idOferta}
                                value={item.idOferta}
                            >
                                Oferta #{item.idOferta} — {item.proveedor.razonSocial}
                            </option>
                        ))}
                    </select>
                </label>

                {ofertasDisponibles.length === 0 && !errorCarga && (
                    <p className="generar-orden__aviso">
                        No hay ofertas adjudicadas pendientes de generar
                        una orden de compra.
                    </p>
                )}

                {oferta && (
                    <div className="generar-orden__resumen">
                        <h3>Información de la oferta</h3>
                        <div className="generar-orden__datos">
                            <p><strong>Proveedor:</strong> {oferta.proveedor.razonSocial}</p>
                            <p><strong>Oferta:</strong> #{oferta.idOferta}</p>
                            <p><strong>Requisición:</strong> {requisicion ? `#${requisicion.idRequisicion}` : "No disponible"}</p>
                            <p><strong>Descuento:</strong> {oferta.descuento ?? 0}%</p>
                            <p><strong>Estado inicial:</strong> Borrador</p>
                        </div>

                        <h3>Productos de la orden</h3>

                        {vistaPrevia.error ? (
                            <p className="generar-orden__error" role="alert">
                                {vistaPrevia.error}
                            </p>
                        ) : (
                            <div className="generar-orden__tabla">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Cantidad</th>
                                            <th>Precio unitario</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vistaPrevia.detalles.map(detalle => (
                                            <tr key={detalle.idDetalle}>
                                                <td>{detalle.producto.descripcion}</td>
                                                <td>{detalle.cantidad}</td>
                                                <td>{moneda(detalle.precio)}</td>
                                                <td>{moneda(detalle.subtotal)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {!vistaPrevia.error && (
                            <div className="generar-orden__total">
                                <span>Total de la orden</span>
                                <strong>{moneda(total)}</strong>
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <p className="generar-orden__error" role="alert">
                        {error}
                    </p>
                )}

                {mensaje && (
                    <p className="generar-orden__exito" role="status">
                        {mensaje}
                    </p>
                )}

                <button
                    type="submit"
                    className="generar-orden__boton"
                    disabled={
                        guardando ||
                        Boolean(errorCarga) ||
                        !oferta ||
                        !requisicion ||
                        Boolean(vistaPrevia.error) ||
                        vistaPrevia.detalles.length === 0
                    }
                >
                    {guardando ? "Generando..." : "Generar orden en borrador"}
                </button>
            </form>
        </section>
    );
}
