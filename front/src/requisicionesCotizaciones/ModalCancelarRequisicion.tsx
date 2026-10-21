import { useEffect, useId, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

import type { Requisicion } from "./tipos";

import {
    codigoRequisicion,
} from "./formatoRequisicion";

import "./ModalCancelarRequisicion.css";

interface Props {
    requisicion: Requisicion;
    bloqueada: boolean;
    onCerrar: () => void;
    onConfirmar: () => void;
}

export default function ModalCancelarRequisicion({
    requisicion,
    bloqueada,
    onCerrar,
    onConfirmar,
}: Props) {
    const referencia = useRef<HTMLDialogElement>(null);
    const id = useId();

    useEffect(() => {
        const modal = referencia.current;

        if (!modal) return;

        const overflowAnterior =
            document.body.style.overflow;

        document.body.style.overflow = "hidden";

        if (!modal.open) {
            modal.showModal();
        }

        return () => {
            if (modal.open) {
                modal.close();
            }

            document.body.style.overflow =
                overflowAnterior;
        };
    }, []);

    return (
        <dialog
            ref={referencia}
            className="modal-cancelar-requisicion"
            aria-labelledby={`${id}-titulo`}
            aria-describedby={`${id}-descripcion`}
            onCancel={event => {
                event.preventDefault();
                onCerrar();
            }}
        >
            <div className="modal-cancelar-requisicion__contenido">
                <header className="modal-cancelar-requisicion__encabezado">
                    <div className="modal-cancelar-requisicion__icono">
                        <AlertTriangle
                            size={25}
                            aria-hidden="true"
                        />
                    </div>

                    <button
                        type="button"
                        className="modal-cancelar-requisicion__cerrar"
                        aria-label="Cerrar confirmación"
                        onClick={onCerrar}
                    >
                        <X size={20} aria-hidden="true" />
                    </button>
                </header>

                <div className="modal-cancelar-requisicion__texto">
                    <span className="modal-cancelar-requisicion__subtitulo">
                        Confirmación
                    </span>

                    <h2 id={`${id}-titulo`}>
                        ¿Cancelar requisición?
                    </h2>

                    <p id={`${id}-descripcion`}>
                        La requisición pasará a estado{" "}
                        <strong>Cancelada</strong> y no
                        continuará a cotización.
                        Sus datos se conservarán.
                    </p>
                </div>

                <div className="modal-cancelar-requisicion__resumen">
                    <strong className="modal-cancelar-requisicion__codigo">
                        {codigoRequisicion(
                            requisicion.idRequisicion,
                        )}
                    </strong>

                    <dl>
                        <div>
                            <dt>Solicitante</dt>
                            <dd>
                                {requisicion.solicitante}
                            </dd>
                        </div>

                        <div>
                            <dt>Prioridad</dt>
                            <dd>
                                {requisicion.prioridad}
                            </dd>
                        </div>
                    </dl>
                </div>

                {bloqueada && (
                    <p
                        role="alert"
                        className="modal-cancelar-requisicion__error"
                    >
                        Esta requisición ya no está disponible
                        para cancelación.
                    </p>
                )}

                <footer className="modal-cancelar-requisicion__acciones">
                    <button
                        type="button"
                        className="modal-cancelar-requisicion__volver"
                        onClick={onCerrar}
                        autoFocus
                    >
                        Volver
                    </button>

                    <button
                        type="button"
                        className="modal-cancelar-requisicion__confirmar"
                        disabled={bloqueada}
                        onClick={onConfirmar}
                    >
                        Sí, cancelar requisición
                    </button>
                </footer>
            </div>
        </dialog>
    );
}