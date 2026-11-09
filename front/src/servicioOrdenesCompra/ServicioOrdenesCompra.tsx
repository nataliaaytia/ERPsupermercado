//NATALIA: SCRUM-523 Y 524

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { OrdenCompra } from "./tipos";
//import CondicionesLogisticasOrden from "./CondicionesLogisticasOrden";
import CondicionesLogisticasOrden from "./CondicionesLogisticasOrden";
import MenuLateral from "../requisicionesCotizaciones/MenuLateral";
import { useRequisiciones } from "../requisicionesCotizaciones/useRequisiciones";
import {
    cargarOrdenesCompra,
    cantidadComprometida,
    guardarOrdenesCompra,
    fechaHoy,
    registrarCompromiso,
} from "./compromisosEntrega";
import "../requisicionesCotizaciones/Requisiciones.css";
import "./ServicioOrdenesCompra.css";

//scrum 525
import SeguimientoEntregas from "./SeguimientoEntregas";

const opcionesOrdenes = [
    "Crear orden",
    "Compromisos de entrega",
    "Condiciones logísticas",
    "Pendientes de entrega",
];

/*
function cargarInicial(): {
    ordenes: OrdenCompra[];
    error: string;
} {
    try {
        return {
            ordenes: cargarOrdenesCompra(),
            error: "",
        };
    } catch {
        return {
            ordenes: [],
            error: "No se pudieron cargar las órdenes de compra guardadas.",
        };
    }
}
*/

export default function ServicioOrdenesCompra() {
    /*
    const [datos, setDatos] = useState(cargarInicial);
    const { requisiciones, solicitudes, ofertas } = useRequisiciones();
    */
    const compras = useRequisiciones();

    const { requisiciones, solicitudes, ofertas } = compras;

    const datos = {
        ordenes: compras.ordenes,
        error: compras.errorCarga,
    };

    const [idOferta, setIdOferta] = useState("");
    const [errorOrden, setErrorOrden] = useState("");
    const [opcionActiva, setOpcionActiva] = useState(0);
    const [menuAbierto, setMenuAbierto] = useState(true);
    const [idOrden, setIdOrden] = useState("");
    const [idDetalle, setIdDetalle] = useState("");
    const [fechaEntrega, setFechaEntrega] = useState(fechaHoy);
    const [cantidad, setCantidad] = useState("");
    const [observacion, setObservacion] = useState("");
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        if (!mensaje) return;

        const temporizador = window.setTimeout(
            () => setMensaje(""),
            3500,
        );

        return () => window.clearTimeout(temporizador);
    }, [mensaje]);

    const ofertasDisponibles = ofertas.filter(
        oferta =>
            oferta.estado === "Seleccionada" &&
            !datos.ordenes.some(
                orden => orden.idOfertaOrigen === oferta.idOferta,
            ),
    );

    const confirmadas = datos.ordenes.filter(
        orden => orden.estado === "Confirmada",
    );

    const orden = confirmadas.find(
        item => item.idOrden === Number(idOrden),
    );

    const detalle = orden?.detalles.find(
        item => item.idDetalle === Number(idDetalle),
    );

    const comprometida = detalle
        ? cantidadComprometida(detalle)
        : 0;

    const pendiente = detalle
        ? detalle.cantidad - comprometida
        : 0;

    const compromisos =
        orden?.detalles
            .flatMap(linea =>
                (linea.compromisos ?? []).map(compromiso => ({
                    linea,
                    compromiso,
                })),
            )
            .sort((a, b) =>
                a.compromiso.fechaEntrega.localeCompare(
                    b.compromiso.fechaEntrega,
                ),
            ) ?? [];

    function limpiarAvisos() {
        setError("");
        setMensaje("");
    }

    function crearYConfirmarOrden(
        evento: FormEvent<HTMLFormElement>,
    ) {
        evento.preventDefault();
        setErrorOrden("");

        try {
            const oferta = ofertasDisponibles.find(
                item => item.idOferta === Number(idOferta),
            );

            if (!oferta) {
                throw new Error(
                    "Selecciona una oferta para crear la orden.",
                );
            }

            const solicitud = solicitudes.find(
                item => item.idSolicitud === oferta.solicitud,
            );

            const requisicion = requisiciones.find(
                item =>
                    item.idRequisicion === solicitud?.requisicion,
            );

            if (!requisicion || requisicion.detalles.length === 0) {
                throw new Error(
                    "La oferta no tiene una requisición con productos.",
                );
            }

            const ordenes = cargarOrdenesCompra();

            if (
                ordenes.some(
                    item => item.idOfertaOrigen === oferta.idOferta,
                )
            ) {
                throw new Error(
                    "Esta oferta ya tiene una orden de compra.",
                );
            }

            const descuento = oferta.descuento ?? 0;

            if (
                !Number.isFinite(descuento) ||
                descuento < 0 ||
                descuento > 100
            ) {
                throw new Error(
                    "El descuento de la oferta no es válido.",
                );
            }

            const detalles = requisicion.detalles.map(
                (linea, indice) => {
                    const cotizado = oferta.detalles.find(
                        item =>
                            item.producto.idProducto ===
                            linea.producto.idProducto,
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
                        subtotal: Number(
                            (
                                linea.cantidad *
                                cotizado.precio *
                                (1 - descuento / 100)
                            ).toFixed(2),
                        ),
                    };
                },
            );

            const idOrdenNueva =
                ordenes.reduce(
                    (max, item) => Math.max(max, item.idOrden),
                    0,
                ) + 1;

            const nuevaOrden: OrdenCompra = {
                idOrden: idOrdenNueva,
                idOfertaOrigen: oferta.idOferta,
                numero: `OC-${String(idOrdenNueva).padStart(4, "0")}`,
                fecha: fechaHoy(),
                estado: "Confirmada",
                total: Number(
                    detalles
                        .reduce(
                            (total, linea) => total + linea.subtotal,
                            0,
                        )
                        .toFixed(2),
                ),
                observacion: requisicion.observacion,
                detalles,
            };

            const actualizadas = [...ordenes, nuevaOrden];

            /*
            localStorage.setItem(
                CLAVE_ORDENES_COMPRA,
                JSON.stringify(actualizadas),
            );

            setDatos({ ordenes: actualizadas, error: "" });
            */
            guardarOrdenesCompra(actualizadas);
            setIdOferta("");
            setIdOrden(String(idOrdenNueva));
            setIdDetalle(String(detalles[0].idDetalle));
            setOpcionActiva(1);
            setFechaEntrega(fechaHoy());
            setCantidad("");
            setObservacion("");
            limpiarAvisos();
        } catch (fallo) {
            setErrorOrden(
                fallo instanceof Error
                    ? fallo.message
                    : "No se pudo crear la orden.",
            );
        }
    }

    function guardar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        limpiarAvisos();

        if (!orden || !detalle) {
            setError(
                "Selecciona una orden confirmada y una de sus líneas.",
            );
            return;
        }

        try {
            registrarCompromiso({
                idOrden: orden.idOrden,
                idDetalle: detalle.idDetalle,
                fechaEntrega,
                cantidad,
                observacion,
            });

            //setDatos({ ordenes, error: "" });
            setCantidad("");
            setObservacion("");
            setMensaje(
                "Compromiso de entrega registrado correctamente.",
            );
        } catch (fallo) {
            setError(
                fallo instanceof Error
                    ? fallo.message
                    : "No se pudo guardar el compromiso.",
            );
        }
    }

    return (
        <div className="requisiciones-container">
            <MenuLateral
                titulo="Órdenes de compra"
                opciones={opcionesOrdenes}
                opcionActiva={opcionActiva}
                abierto={menuAbierto}
                onAbrirCerrar={() =>
                    setMenuAbierto(actual => !actual)
                }
                onElegir={setOpcionActiva}
            />

            <section className="requisiciones-contenido ordenes-compra">
                <header className="requisiciones-header">
                    <p className="requisiciones-subtitulo">
                        Órdenes de compra
                    </p>
                    <h1 className="requisiciones-titulo">
                        {opcionesOrdenes[opcionActiva]}
                    </h1>
                </header>
                {!datos.error && opcionActiva === 3 && (
                    <SeguimientoEntregas />
                )}

                {datos.error ? (
                    <p className="ordenes-compra__error" role="alert">
                        {datos.error}
                    </p>
                ) : (
                    <>
                        {opcionActiva === 0 && (
                            <form
                                className="ordenes-compra__tarjeta"
                                onSubmit={crearYConfirmarOrden}
                            >
                                <h2>Crear orden desde una oferta</h2>

                                {ofertasDisponibles.length === 0 ? (
                                    <p>
                                        No hay ofertas seleccionadas pendientes
                                        de generar una orden. Selecciona una
                                        oferta en Requisiciones para continuar.
                                    </p>
                                ) : (
                                    <>
                                        <label className="ordenes-compra__campo">
                                            Oferta seleccionada
                                            <select
                                                value={idOferta}
                                                onChange={evento => {
                                                    setIdOferta(evento.target.value);
                                                    setErrorOrden("");
                                                }}
                                                required
                                            >
                                                <option value="">
                                                    Selecciona una oferta
                                                </option>

                                                {ofertasDisponibles.map(oferta => (
                                                    <option
                                                        key={oferta.idOferta}
                                                        value={oferta.idOferta}
                                                    >
                                                        {oferta.proveedor.razonSocial}
                                                        {" · Oferta "}
                                                        {oferta.idOferta}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>

                                        <button type="submit">
                                            Crear y confirmar orden
                                        </button>
                                    </>
                                )}

                                {errorOrden && (
                                    <p
                                        className="ordenes-compra__error"
                                        role="alert"
                                    >
                                        {errorOrden}
                                    </p>
                                )}
                            </form>
                        )}

                        {opcionActiva === 1 && (
                            confirmadas.length === 0 ? (
                                <div className="ordenes-compra__tarjeta">
                                    <p>
                                        No hay órdenes confirmadas disponibles
                                        para programar entregas.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <label className="ordenes-compra__campo">
                                        Orden confirmada
                                        <select
                                            value={idOrden}
                                            onChange={evento => {
                                                setIdOrden(evento.target.value);
                                                setIdDetalle("");
                                                setFechaEntrega(fechaHoy());
                                                setCantidad("");
                                                setObservacion("");
                                                limpiarAvisos();
                                            }}
                                        >
                                            <option value="">
                                                Selecciona una orden
                                            </option>

                                            {confirmadas.map(item => (
                                                <option
                                                    key={item.idOrden}
                                                    value={item.idOrden}
                                                >
                                                    {item.numero}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    {orden && (
                                        <>
                                            <div className="ordenes-compra__resumen">
                                                <strong>{orden.numero}</strong>
                                                <span>
                                                    Fecha de orden: {orden.fecha}
                                                </span>
                                                <span className="ordenes-compra__estado">
                                                    {orden.estado}
                                                </span>
                                            </div>

                                            <form
                                                className="ordenes-compra__tarjeta"
                                                onSubmit={guardar}
                                                noValidate
                                            >
                                                <h2>
                                                    Registrar compromiso de entrega
                                                </h2>

                                                <label className="ordenes-compra__campo">
                                                    Línea de la orden
                                                    <select
                                                        value={idDetalle}
                                                        onChange={evento => {
                                                            setIdDetalle(
                                                                evento.target.value,
                                                            );
                                                            setCantidad("");
                                                            limpiarAvisos();
                                                        }}
                                                    >
                                                        <option value="">
                                                            Selecciona una línea
                                                        </option>

                                                        {orden.detalles.map(
                                                            (linea, indice) => (
                                                                <option
                                                                    key={linea.idDetalle}
                                                                    value={linea.idDetalle}
                                                                >
                                                                    {indice + 1}
                                                                    {". "}
                                                                    {linea.producto.descripcion}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </label>

                                                {detalle && (
                                                    <dl className="ordenes-compra__cantidades">
                                                        <div>
                                                            <dt>Ordenado</dt>
                                                            <dd>{detalle.cantidad}</dd>
                                                        </div>

                                                        <div>
                                                            <dt>Comprometido</dt>
                                                            <dd>{comprometida}</dd>
                                                        </div>

                                                        <div>
                                                            <dt>Por programar</dt>
                                                            <dd>{pendiente}</dd>
                                                        </div>
                                                    </dl>
                                                )}

                                                <fieldset
                                                    disabled={!detalle || pendiente <= 0}
                                                >
                                                    <div className="ordenes-compra__fila">
                                                        <label className="ordenes-compra__campo">
                                                            Fecha de entrega
                                                            <input
                                                                type="date"
                                                                value={fechaEntrega}
                                                                min={
                                                                    orden.fecha > fechaHoy()
                                                                        ? orden.fecha
                                                                        : fechaHoy()
                                                                }
                                                                onChange={evento => {
                                                                    setFechaEntrega(
                                                                        evento.target.value,
                                                                    );
                                                                    limpiarAvisos();
                                                                }}
                                                                required
                                                            />
                                                        </label>

                                                        <label className="ordenes-compra__campo">
                                                            Cantidad
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max={Math.max(0, pendiente)}
                                                                step="1"
                                                                value={cantidad}
                                                                onChange={evento => {
                                                                    setCantidad(
                                                                        evento.target.value,
                                                                    );
                                                                    limpiarAvisos();
                                                                }}
                                                                required
                                                            />
                                                        </label>
                                                    </div>

                                                    <label className="ordenes-compra__campo">
                                                        Observación
                                                        <textarea
                                                            rows={3}
                                                            value={observacion}
                                                            onChange={evento => {
                                                                setObservacion(
                                                                    evento.target.value,
                                                                );
                                                                limpiarAvisos();
                                                            }}
                                                        />
                                                    </label>

                                                    <button type="submit">
                                                        Guardar compromiso
                                                    </button>
                                                </fieldset>

                                                {detalle && pendiente <= 0 && (
                                                    <p>
                                                        Esta línea ya tiene toda su
                                                        cantidad programada.
                                                    </p>
                                                )}

                                                {error && (
                                                    <p
                                                        className="ordenes-compra__error"
                                                        role="alert"
                                                    >
                                                        {error}
                                                    </p>
                                                )}

                                                {mensaje && (
                                                    <p
                                                        className="ordenes-compra__exito"
                                                        role="status"
                                                    >
                                                        {mensaje}
                                                    </p>
                                                )}
                                            </form>

                                            <section className="ordenes-compra__tarjeta">
                                                <h2>Compromisos registrados</h2>

                                                {compromisos.length === 0 ? (
                                                    <p>
                                                        Esta orden todavía no tiene
                                                        compromisos de entrega.
                                                    </p>
                                                ) : (
                                                    <div className="ordenes-compra__tabla">
                                                        <table>
                                                            <thead>
                                                                <tr>
                                                                    <th>Línea</th>
                                                                    <th>Producto</th>
                                                                    <th>Fecha de entrega</th>
                                                                    <th>Cantidad</th>
                                                                    <th>Estado</th>
                                                                    <th>Observación</th>
                                                                </tr>
                                                            </thead>

                                                            <tbody>
                                                                {compromisos.map(
                                                                    ({ linea, compromiso }) => (
                                                                        <tr
                                                                            key={`${linea.idDetalle}-${compromiso.idCompromiso}`}
                                                                        >
                                                                            <td>
                                                                                {orden.detalles.indexOf(
                                                                                    linea,
                                                                                ) + 1}
                                                                            </td>
                                                                            <td>
                                                                                {linea.producto.descripcion}
                                                                            </td>
                                                                            <td>
                                                                                {compromiso.fechaEntrega}
                                                                            </td>
                                                                            <td>
                                                                                {compromiso.cantidad}
                                                                            </td>
                                                                            <td>
                                                                                {compromiso.estado}
                                                                            </td>
                                                                            <td>
                                                                                {compromiso.observacion ||
                                                                                    "—"}
                                                                            </td>
                                                                        </tr>
                                                                    ),
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </section>
                                        </>
                                    )}
                                </>
                            )
                        )}

                        {opcionActiva === 2 && (
                            <CondicionesLogisticasOrden
                                ordenes={datos.ordenes}
                                onGuardar={guardarOrdenesCompra}
                            />
                        )}
                    </>
                )}
            </section>
        </div>
    );
}