import { useId, useState, type FormEvent } from "react";
import { X, Upload, AlertCircle } from "lucide-react";
import type { Documento } from "./tipos";
import { fechaLocal } from "./funcionesAuxiliares";
import { useModal } from "./useModal";
interface Props {
  onCerrar: () => void;
  onGuardar: (documento: Documento) => void;
}
export default function DocumentoModal({ onCerrar, onGuardar }: Props) {
  const dialogRef = useModal();
  const id = useId();
  const [tipo, setTipo] = useState("Ficha RUC");
  const [numero, setNumero] = useState("");
  const [fecha, setFecha] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [error, setError] = useState("");
  const guardar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!numero.trim() || !fecha || !archivo) {
      setError("Completa el número, la fecha y el archivo adjunto.");
      return;
    }
    if (
      !archivo.name.toLowerCase().endsWith(".pdf") ||
      archivo.size > 10 * 1024 * 1024
    ) {
      setError("Selecciona un PDF de hasta 10 MB.");
      return;
    }
    onGuardar({
      idDocumento: Date.now(),
      tipoDocumento: tipo,
      numeroDocumento: numero.trim(),
      fechaVencimiento: fecha,
      archivo: archivo.name,
      estadoValidacion: fecha >= fechaLocal() ? "Válido" : "Vencido",
    });
  };
  return (
    <dialog
      ref={dialogRef}
      className="catalogo-dialog modal-card"
      aria-labelledby={`${id}-titulo`}
      onCancel={onCerrar}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            onCerrar();
        }
      }}
    >
      <div className="modal-header">
        <div>
          <h2 className="modal-title" id={`${id}-titulo`}>
            Registrar documento
          </h2>
          <p className="modal-subtitle">
            Documentación de soporte del proveedor
          </p>
        </div>
        <button
          type="button"
          className="btn-close-modal"
          onClick={onCerrar}
          aria-label="Cerrar registro"
        >
          <X size={18} />
        </button>
      </div>
      <form onSubmit={guardar} className="modal-form">
        {error && (
          <div className="form-error-msg" role="alert">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        <div className="form-group">
          <label className="form-label" htmlFor={`${id}-tipo`}>
            Tipo de documento
          </label>
          <select
            className="form-input"
            id={`${id}-tipo`}
            value={tipo}
            onChange={(event) => setTipo(event.target.value)}
          >
            {[
              "Ficha RUC",
              "Certificado de Homologación",
              "Licencia de Funcionamiento",
              "Certificación ISO",
            ].map((opcion) => (
              <option key={opcion}>{opcion}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor={`${id}-numero`}>
            Número de documento
          </label>
          <input
            autoFocus
            required
            maxLength={100}
            className="form-input"
            id={`${id}-numero`}
            value={numero}
            onChange={(event) => setNumero(event.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor={`${id}-fecha`}>
            Fecha de vencimiento
          </label>
          <input
            required
            type="date"
            className="form-input"
            id={`${id}-fecha`}
            value={fecha}
            onChange={(event) => setFecha(event.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor={`${id}-archivo`}>
            Archivo PDF · hasta 10 MB
          </label>
          <div className="upload-dropzone">
            <Upload size={20} />
            <span className="upload-text">
              {archivo?.name ?? "Selecciona el documento"}
            </span>
            <input
              required
              id={`${id}-archivo`}
              type="file"
              accept="application/pdf,.pdf"
              className="file-input-hidden"
              onChange={(event) => {
                setArchivo(event.target.files?.[0] ?? null);
                setError("");
              }}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-cancelar" onClick={onCerrar}>
            Cancelar
          </button>
          <button type="submit" className="btn-guardar">
            Guardar documento
          </button>
        </div>
      </form>
    </dialog>
  );
}
