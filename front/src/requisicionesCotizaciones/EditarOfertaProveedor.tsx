import { useId, useState, type FormEvent } from "react";
import type { OfertaProveedor, DetalleOferta } from "./tipos";
import "./EditarOfertaProveedor.css";

export interface DatosActualizacionOferta {
  validez: string;
  descuento: number;
  condicionesEntrega: string;
  detalles: DetalleOferta[];
}

type DetalleEditable = Omit<DetalleOferta, "precio" | "plazoEntrega"> & {
  precio: string;
  plazoEntrega: string;
};

type ErroresDetalle = { precio?: string; plazoEntrega?: string };
type ErroresEdicion = {
  validez?: string;
  descuento?: string;
  condicionesEntrega?: string;
  detalles: Record<number, ErroresDetalle>;
};

interface Props {
  oferta: OfertaProveedor;
  hoy: string;
  onGuardar: (datos: DatosActualizacionOferta) => void;
  onCancelar: () => void;
}

// Tope técnico de captura, no un límite comercial definido por Jira.
const PRECIO_MAXIMO_TECNICO = 999999.99;
const formatoImporte = /^\d+(?:\.\d{1,2})?$/;
const formatoEntero = /^\d+$/;

function fechaValida(fecha: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const fechaObjeto = new Date(`${fecha}T00:00:00Z`);
  return (
    Number.isFinite(fechaObjeto.getTime()) &&
    fechaObjeto.toISOString().slice(0, 10) === fecha
  );
}

function validar(
  validez: string,
  descuento: string,
  condicionesEntrega: string,
  detalles: DetalleEditable[],
  hoy: string,
): ErroresEdicion {
  const errores: ErroresEdicion = { detalles: {} };

  if (!fechaValida(validez) || validez < hoy) {
    errores.validez = "Selecciona una fecha válida que no sea anterior a hoy.";
  }

  const descuentoNumero = Number(descuento);
  if (
    !formatoImporte.test(descuento.trim()) ||
    !Number.isFinite(descuentoNumero) ||
    descuentoNumero < 0 ||
    descuentoNumero > 100
  ) {
    errores.descuento = "El descuento debe estar entre 0 y 100 y tener máximo dos decimales.";
  }

  const condiciones = condicionesEntrega.trim();
  if (!condiciones || condiciones.length > 500) {
    errores.condicionesEntrega =
      "Las condiciones de entrega son obligatorias y no deben superar los 500 caracteres.";
  }

  detalles.forEach((detalle) => {
    const error: ErroresDetalle = {};
    const precio = Number(detalle.precio);
    const plazo = Number(detalle.plazoEntrega);

    if (
      !formatoImporte.test(detalle.precio.trim()) ||
      !Number.isFinite(precio) ||
      precio <= 0 ||
      precio > PRECIO_MAXIMO_TECNICO
    ) {
      error.precio =
        "Ingresa un precio mayor a 0, máximo dos decimales y hasta Bs 999.999,99.";
    }

    if (
      !formatoEntero.test(detalle.plazoEntrega.trim()) ||
      !Number.isSafeInteger(plazo) ||
      plazo < 1
    ) {
      error.plazoEntrega = "El plazo debe ser un número entero mayor a cero.";
    }

    if (error.precio || error.plazoEntrega) {
      errores.detalles[detalle.idDetalle] = error;
    }
  });

  return errores;
}

export default function EditarOfertaProveedor({
  oferta,
  hoy,
  onGuardar,
  onCancelar,
}: Props) {
  const id = useId();
  const [validez, setValidez] = useState(oferta.validez);
  const [descuento, setDescuento] = useState(String(oferta.descuento));
  const [condicionesEntrega, setCondicionesEntrega] = useState(oferta.condicionesEntrega);
  const [detalles, setDetalles] = useState<DetalleEditable[]>(
    oferta.detalles.map((detalle) => ({
      ...detalle,
      precio: String(detalle.precio),
      plazoEntrega: String(detalle.plazoEntrega),
    })),
  );
  const [errores, setErrores] = useState<ErroresEdicion>({ detalles: {} });

  const actualizarDetalle = (
    idDetalle: number,
    campo: "precio" | "plazoEntrega",
    valor: string,
  ) => {
    setDetalles((actuales) =>
      actuales.map((detalle) =>
        detalle.idDetalle === idDetalle
          ? { ...detalle, [campo]: valor }
          : detalle,
      ),
    );
    setErrores((actuales) => {
      const nuevosDetalles = { ...actuales.detalles };
      const nuevoError = { ...nuevosDetalles[idDetalle] };
      delete nuevoError[campo];
      if (nuevoError.precio || nuevoError.plazoEntrega) {
        nuevosDetalles[idDetalle] = nuevoError;
      } else {
        delete nuevosDetalles[idDetalle];
      }
      return { ...actuales, detalles: nuevosDetalles };
    });
  };

  const guardar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const nuevosErrores = validar(validez, descuento, condicionesEntrega, detalles, hoy);
    setErrores(nuevosErrores);

    const primerDetalle = detalles.find((detalle) => nuevosErrores.detalles[detalle.idDetalle]);
    const primerCampo = nuevosErrores.validez
      ? `${id}-validez`
      : nuevosErrores.descuento
        ? `${id}-descuento`
        : nuevosErrores.condicionesEntrega
          ? `${id}-condiciones`
          : primerDetalle
            ? `${id}-${nuevosErrores.detalles[primerDetalle.idDetalle].precio ? "precio" : "plazo"}-${primerDetalle.idDetalle}`
            : null;

    if (primerCampo) {
      document.getElementById(primerCampo)?.focus();
      return;
    }

    onGuardar({
      validez,
      descuento: Number(descuento),
      condicionesEntrega: condicionesEntrega.trim(),
      detalles: detalles.map((detalle) => ({
        ...detalle,
        precio: Number(detalle.precio),
        plazoEntrega: Number(detalle.plazoEntrega),
      })),
    });
  };

  return (
    <form className="editar-oferta" onSubmit={guardar} noValidate>
      <h3>Editar oferta OF-{String(oferta.idOferta).padStart(4, "0")}</h3>
      <p>Proveedor: {oferta.proveedor.razonSocial}</p>

      <label>
        Oferta válida hasta
        <input
          id={`${id}-validez`}
          type="date"
          min={hoy}
          value={validez}
          aria-invalid={Boolean(errores.validez)}
          onChange={(e) => {
            setValidez(e.target.value);
            setErrores((actuales) => ({ ...actuales, validez: undefined }));
          }}
        />
        {errores.validez && <span role="alert" className="editar-oferta__error-campo">{errores.validez}</span>}
      </label>

      <label>
        Descuento ofrecido (%)
        <input
          id={`${id}-descuento`}
          type="text"
          inputMode="decimal"
          value={descuento}
          aria-invalid={Boolean(errores.descuento)}
          onChange={(e) => {
            setDescuento(e.target.value);
            setErrores((actuales) => ({ ...actuales, descuento: undefined }));
          }}
        />
        {errores.descuento && <span role="alert" className="editar-oferta__error-campo">{errores.descuento}</span>}
      </label>

      <label>
        Condiciones de entrega
        <textarea
          id={`${id}-condiciones`}
          value={condicionesEntrega}
          maxLength={500}
          aria-invalid={Boolean(errores.condicionesEntrega)}
          onChange={(e) => {
            setCondicionesEntrega(e.target.value);
            setErrores((actuales) => ({ ...actuales, condicionesEntrega: undefined }));
          }}
        />
        {errores.condicionesEntrega && <span role="alert" className="editar-oferta__error-campo">{errores.condicionesEntrega}</span>}
      </label>

      {detalles.map((detalle) => (
        <fieldset key={detalle.idDetalle}>
          <legend>{detalle.producto.descripcion}</legend>
          <label>
            Precio unitario (Bs)
            <input
              id={`${id}-precio-${detalle.idDetalle}`}
              type="text"
              inputMode="decimal"
              value={detalle.precio}
              aria-invalid={Boolean(errores.detalles[detalle.idDetalle]?.precio)}
              onChange={(e) => actualizarDetalle(detalle.idDetalle, "precio", e.target.value)}
            />
            {errores.detalles[detalle.idDetalle]?.precio && (
              <span role="alert" className="editar-oferta__error-campo">{errores.detalles[detalle.idDetalle].precio}</span>
            )}
          </label>
          <label>
            Plazo de entrega (días)
            <input
              id={`${id}-plazo-${detalle.idDetalle}`}
              type="text"
              inputMode="numeric"
              value={detalle.plazoEntrega}
              aria-invalid={Boolean(errores.detalles[detalle.idDetalle]?.plazoEntrega)}
              onChange={(e) => actualizarDetalle(detalle.idDetalle, "plazoEntrega", e.target.value)}
            />
            {errores.detalles[detalle.idDetalle]?.plazoEntrega && (
              <span role="alert" className="editar-oferta__error-campo">{errores.detalles[detalle.idDetalle].plazoEntrega}</span>
            )}
          </label>
        </fieldset>
      ))}

      <div className="selector-proveedores-acciones">
        <button type="submit">Guardar cambios</button>
        <button type="button" onClick={onCancelar}>Cancelar edición</button>
      </div>
    </form>
  );
}
