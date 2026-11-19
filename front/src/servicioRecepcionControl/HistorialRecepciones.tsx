import { useState } from "react";
import type { OfertaProveedor } from "../requisicionesCotizaciones/tipos";
import type { OrdenCompra, RecepcionValidada } from "../servicioOrdenesCompra/tipos";
import CostoTransporteRecepcion from "./CostoTransporteRecepcion";
import ConciliacionRecepcion from "./ConciliacionRecepcion";
import EditorRecepcion from "./EditorRecepcion";
import InspeccionCalidadRecepcion from "./InspeccionCalidadRecepcion";
import ResumenCantidadesRecepcion from "./ResumenCantidadesRecepcion";
import type { RecepcionRegistrada } from "./tiposRecepcion";
import type {
    DatosInspeccionCalidad,
    InspeccionCalidadRecepcion as DatosInspeccion,
} from "./tiposInspeccion";

interface Props {
    puedeConsultar: boolean;
    onSolicitarLogin?: () => void;
    ordenes: readonly OrdenCompra[];
    ofertas: readonly OfertaProveedor[];
    recepciones: readonly RecepcionRegistrada[];
    validadas: readonly RecepcionValidada[];
    inspecciones: readonly DatosInspeccion[];
    onRegistrarInspeccion: (datos: DatosInspeccionCalidad) => void;
}

interface Filtros {
    orden: string;
    proveedor: string;
    fecha: string;
}

interface GrupoRecepciones {
    numeroOrden: string;
    orden?: OrdenCompra;
    proveedor: string;
    recepciones: RecepcionRegistrada[];
}

function normalizar(texto: string) {
    return texto.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function buscarRecepciones(
    { ordenes, ofertas, recepciones }: Pick<Props, "ordenes" | "ofertas" | "recepciones">,
    filtros: Filtros,
) {
    const ordenPorId = new Map(ordenes.map(orden => [orden.idOrden, orden]));
    const proveedorPorOferta = new Map(ofertas.map(oferta => [oferta.idOferta, oferta.proveedor]));
    const grupos = new Map<number, GrupoRecepciones>();
    const filtroOrden = normalizar(filtros.orden);
    const filtroProveedor = normalizar(filtros.proveedor);

    const ordenadas = [...recepciones].sort(
        (a, b) => b.fecha.localeCompare(a.fecha) || b.idRecepcion - a.idRecepcion,
    );

    for (const recepcion of ordenadas) {
        const orden = ordenPorId.get(recepcion.idOrden);
        const numeroOrden = orden?.numero ?? `Orden #${recepcion.idOrden}`;
        const proveedor = orden?.idOfertaOrigen === undefined
            ? undefined
            : proveedorPorOferta.get(orden.idOfertaOrigen);

        if (filtros.fecha && recepcion.fecha !== filtros.fecha) continue;

        if (
            filtroOrden &&
            !normalizar(numeroOrden).includes(filtroOrden) &&
            String(recepcion.idOrden) !== filtroOrden
        ) continue;

        if (
            filtroProveedor &&
            !normalizar(proveedor?.razonSocial ?? "").includes(filtroProveedor)
        ) continue;

        let grupo = grupos.get(recepcion.idOrden);

        if (!grupo) {
            grupo = {
                numeroOrden,
                orden,
                proveedor: proveedor?.razonSocial ?? "Proveedor sin identificar",
                recepciones: [],
            };

            grupos.set(recepcion.idOrden, grupo);
        }

        grupo.recepciones.push(recepcion);
    }

    return Array.from(grupos.entries());
}

export default function HistorialRecepciones(props: Props) {
    const [orden, setOrden] = useState("");
    const [proveedor, setProveedor] = useState("");
    const [fecha, setFecha] = useState("");

    if (!props.puedeConsultar) {
        return (
            <section className="ordenes-compra__tarjeta">
                <p>Inicia sesión para consultar el historial de recepciones.</p>
                {props.onSolicitarLogin && (
                    <button
                        type="button"
                        onClick={props.onSolicitarLogin}
                    >
                        Iniciar sesión y volver al historial
                    </button>
                )}
            </section>
        );
    }

    const grupos = buscarRecepciones(props, { orden, proveedor, fecha });

    const idsValidados = new Set(
        props.validadas
            .filter(recepcion => recepcion.estado === "Validada")
            .map(recepcion => `${recepcion.idOrden}:${recepcion.idRecepcion}`),
    );

    return (
        <section className="ordenes-compra__tarjeta">
            <h2>Historial de entregas</h2>

            <div className="ordenes-compra__fila">
                <label className="ordenes-compra__campo">
                    Orden de compra
                    <input
                        type="search"
                        value={orden}
                        onChange={evento => setOrden(evento.target.value)}
                        placeholder="Número de orden"
                    />
                </label>

                <label className="ordenes-compra__campo">
                    Proveedor
                    <input
                        type="search"
                        value={proveedor}
                        onChange={evento => setProveedor(evento.target.value)}
                        placeholder="Razón social"
                    />
                </label>
            </div>

            <label className="ordenes-compra__campo">
                Fecha de recepción
                <input
                    type="date"
                    value={fecha}
                    onChange={evento => setFecha(evento.target.value)}
                />
            </label>

            {grupos.length === 0 && (
                <p role="status">
                    {props.recepciones.length === 0
                        ? "Todavía no hay recepciones registradas."
                        : "No hay recepciones que coincidan con los filtros."}
                </p>
            )}

            {grupos.map(([idOrden, grupo]) => (
                <section key={idOrden} className="ordenes-compra__tarjeta">
                    <h3>{grupo.numeroOrden} · {grupo.proveedor}</h3>

                    {grupo.recepciones.map(recepcion => {
                        const inspeccion = props.inspecciones.find(
                            item =>
                                item.idRecepcion === recepcion.idRecepcion &&
                                item.idOrden === recepcion.idOrden,
                        );
                        const validacion = props.validadas.find(
                            item =>
                                item.idRecepcion === recepcion.idRecepcion &&
                                item.idOrden === recepcion.idOrden &&
                                item.estado === "Validada",
                        );
                        const estado = validacion
                            ? "Validada"
                            : inspeccion
                              ? "Inspeccionada"
                              : recepcion.estado;

                        return (
                            <details key={recepcion.idRecepcion}>
                                <summary>{recepcion.documento} · {recepcion.fecha} · {estado}</summary>

                                <p><strong>Documento de entrega:</strong> {recepcion.documento}</p>

                                {(inspeccion ||
                                    (!idsValidados.has(
                                        `${recepcion.idOrden}:${recepcion.idRecepcion}`,
                                    ) &&
                                        (recepcion.estado ===
                                            "Pendiente de inspección" ||
                                            recepcion.estado ===
                                                "En inspección"))) && (
                                    <InspeccionCalidadRecepcion
                                        idRecepcion={recepcion.idRecepcion}
                                        detallesRecibidos={recepcion.detalles}
                                        orden={grupo.orden}
                                        inspeccion={inspeccion}
                                        onRegistrar={
                                            props.onRegistrarInspeccion
                                        }
                                    />
                                )}

                                <ResumenCantidadesRecepcion
                                    recepcion={recepcion}
                                    validadas={props.validadas}
                                />

                                {inspeccion && (
                                    <ConciliacionRecepcion
                                        recepcion={recepcion}
                                        inspeccion={inspeccion}
                                        validacion={validacion}
                                    />
                                )}

                                <EditorRecepcion
                                    recepcion={recepcion}
                                    orden={grupo.orden}
                                    recepcionesValidadas={props.validadas}
                                    inspeccionRegistrada={Boolean(inspeccion)}
                                />

                                <CostoTransporteRecepcion
                                    recepcion={recepcion}
                                    recepcionesValidadas={props.validadas}
                                />
                            </details>
                        );
                    })}
                </section>
            ))}
        </section>
    );
}