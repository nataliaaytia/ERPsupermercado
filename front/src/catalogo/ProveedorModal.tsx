import { useId, useState, type FormEvent } from "react";
import { AlertCircle, Building2, X } from "lucide-react";
import type { DatosProveedor } from "./tipos";
import { useModal } from "./useModal";
import {
  normalizarProveedor,
  validarProveedor,
  type ErroresProveedor,
} from "./validacionProveedor";
import "./ProveedorModal.css";

interface Props {
  nitsExistentes: string[];
  onCerrar: () => void;
  onGuardar: (datos: DatosProveedor) => string | null;
}

const campos: {
  nombre: keyof DatosProveedor;
  etiqueta: string;
  tipo: string;
  autocomplete: string;
  maximo: number;
}[] = [
  {
    nombre: "razonSocial",
    etiqueta: "Razón social",
    tipo: "text",
    autocomplete: "organization",
    maximo: 160,
  },
  {
    nombre: "nitRuc",
    etiqueta: "NIT / RUC",
    tipo: "text",
    autocomplete: "off",
    maximo: 30,
  },
  {
    nombre: "direccion",
    etiqueta: "Dirección fiscal",
    tipo: "text",
    autocomplete: "street-address",
    maximo: 240,
  },
  {
    nombre: "telefono",
    etiqueta: "Teléfono",
    tipo: "tel",
    autocomplete: "tel",
    maximo: 30,
  },
  {
    nombre: "correo",
    etiqueta: "Correo electrónico",
    tipo: "email",
    autocomplete: "email",
    maximo: 160,
  },
];

export default function ProveedorModal({
  nitsExistentes,
  onCerrar,
  onGuardar,
}: Props) {
  const ref = useModal();
  const id = useId();
  const [datos, setDatos] = useState<DatosProveedor>({
    nitRuc: "",
    razonSocial: "",
    direccion: "",
    telefono: "",
    correo: "",
  });
  const [errores, setErrores] = useState<ErroresProveedor>({});
  const [errorGeneral, setErrorGeneral] = useState("");

  const guardar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizados = normalizarProveedor(datos);
    const nuevosErrores = validarProveedor(normalizados, nitsExistentes);
    setErrores(nuevosErrores);
    setErrorGeneral("");
    const primerCampo = campos.find((campo) => nuevosErrores[campo.nombre]);
    if (primerCampo) {
      document.getElementById(`${id}-${primerCampo.nombre}`)?.focus();
      return;
    }
    const error = onGuardar(normalizados);
    if (error) setErrorGeneral(error);
  };

  return (
    <dialog
      ref={ref}
      className="catalogo-dialog proveedor-modal"
      aria-labelledby={`${id}-titulo`}
      onCancel={onCerrar}
    >
      <div className="modal-header">
        <div>
          <span className="proveedor-modal__icono">
            <Building2 size={20} />
          </span>
          <h2 className="modal-title" id={`${id}-titulo`}>
            Registrar proveedor
          </h2>
          <p className="modal-subtitle">
            Completa sus datos de contacto. Todos los campos son obligatorios.
          </p>
        </div>
        <button
          type="button"
          className="btn-close-modal"
          aria-label="Cerrar registro de proveedor"
          onClick={onCerrar}
        >
          <X size={18} />
        </button>
      </div>
      <form
        className="proveedor-modal__formulario"
        onSubmit={guardar}
        noValidate
      >
        {errorGeneral && (
          <p role="alert" className="form-error-msg">
            <AlertCircle size={16} />
            {errorGeneral}
          </p>
        )}
        {campos.map((campo, index) => (
          <div key={campo.nombre} className="form-group">
            <label className="form-label" htmlFor={`${id}-${campo.nombre}`}>
              {campo.etiqueta}
            </label>
            <input
              className="form-input"
              id={`${id}-${campo.nombre}`}
              type={campo.tipo}
              autoFocus={index === 0}
              autoComplete={campo.autocomplete}
              inputMode={campo.nombre === "nitRuc" ? "numeric" : undefined}
              maxLength={campo.maximo}
              required
              value={datos[campo.nombre]}
              aria-invalid={Boolean(errores[campo.nombre])}
              aria-describedby={
                errores[campo.nombre]
                  ? `${id}-${campo.nombre}-error`
                  : undefined
              }
              onChange={(event) => {
                setDatos((actuales) => ({
                  ...actuales,
                  [campo.nombre]: event.target.value,
                }));
                setErrores((actuales) => ({
                  ...actuales,
                  [campo.nombre]: undefined,
                }));
                setErrorGeneral("");
              }}
            />
            {errores[campo.nombre] && (
              <span
                className="proveedor-modal__error"
                id={`${id}-${campo.nombre}-error`}
                role="alert"
              >
                {errores[campo.nombre]}
              </span>
            )}
          </div>
        ))}
        <p className="proveedor-modal__nota">
          El proveedor se registra como pendiente. Podrás agregar su
          documentación y cambiar su estado desde su ficha.
        </p>
        <div className="modal-footer">
          <button type="button" className="btn-cancelar" onClick={onCerrar}>
            Cancelar
          </button>
          <button type="submit" className="btn-guardar">
            Guardar proveedor
          </button>
        </div>
      </form>
    </dialog>
  );
}
