import { useId, useRef, useState, type FormEvent } from "react";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import type { DatosRequisicion } from "./tipos";
import {
  hayErrores,
  validarRequisicion,
  type ErroresRequisicion,
} from "./validacionRequisicion";
import "./FormularioRequisicion.css";

interface Props {
  onGuardar: (datos: DatosRequisicion) => void;
}

const datosVacios = (): DatosRequisicion => ({
  productos: [{ id: 1, nombre: "", cantidad: "" }],
  motivo: "",
});

const sinErrores: ErroresRequisicion = { productos: {} };

export default function FormularioRequisicion({ onGuardar }: Props) {
  const id = useId();
  const siguienteId = useRef(2);
  const [datos, setDatos] = useState<DatosRequisicion>(datosVacios);
  const [errores, setErrores] = useState<ErroresRequisicion>(sinErrores);

  const cambiarProducto = (
    idProducto: number,
    campo: "nombre" | "cantidad",
    valor: string,
  ) => {
    setDatos((actuales) => ({
      ...actuales,
      productos: actuales.productos.map((producto) =>
        producto.id === idProducto ? { ...producto, [campo]: valor } : producto,
      ),
    }));
    quitarErrorProducto(idProducto);
  };

  const quitarErrorProducto = (idProducto: number) => {
    setErrores((actuales) => {
      const productos = { ...actuales.productos };
      delete productos[idProducto];
      return { ...actuales, productos };
    });
  };

  const agregarProducto = () => {
    setDatos((actuales) => ({
      ...actuales,
      productos: [
        ...actuales.productos,
        { id: siguienteId.current++, nombre: "", cantidad: "" },
      ],
    }));
    setErrores((actuales) => ({ ...actuales, general: undefined }));
  };

  const quitarProducto = (idProducto: number) => {
    setDatos((actuales) => ({
      ...actuales,
      productos: actuales.productos.filter(
        (producto) => producto.id !== idProducto,
      ),
    }));
    quitarErrorProducto(idProducto);
  };

  const cambiarMotivo = (motivo: string) => {
    setDatos((actuales) => ({ ...actuales, motivo }));
    setErrores((actuales) => ({ ...actuales, motivo: undefined }));
  };

  const enfocarPrimerError = (nuevosErrores: ErroresRequisicion) => {
    const producto = datos.productos.find(
      (item) => nuevosErrores.productos[item.id],
    );
    if (producto) {
      const campo = nuevosErrores.productos[producto.id]?.nombre
        ? "nombre"
        : "cantidad";
      document.getElementById(`${id}-${campo}-${producto.id}`)?.focus();
      return;
    }
    if (nuevosErrores.motivo) document.getElementById(`${id}-motivo`)?.focus();
  };

  const guardar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nuevosErrores = validarRequisicion(datos);
    setErrores(nuevosErrores);
    if (hayErrores(nuevosErrores)) {
      enfocarPrimerError(nuevosErrores);
      return;
    }
    onGuardar(datos);
    siguienteId.current = 2;
    setDatos(datosVacios());
    setErrores(sinErrores);
  };

  return (
    <form className="formulario-requisicion" onSubmit={guardar} noValidate>
      {errores.general && (
        <p role="alert" className="formulario-requisicion__error-general">
          <AlertCircle size={16} />
          {errores.general}
        </p>
      )}

      <div className="formulario-requisicion__productos">
        <div className="formulario-requisicion__encabezado">
          <span>Producto</span>
          <span>Cantidad</span>
          <span />
        </div>
        {datos.productos.map((producto, indice) => {
          const error = errores.productos[producto.id];
          return (
            <div key={producto.id} className="formulario-requisicion__fila">
              <div className="formulario-requisicion__campo">
                <input
                  id={`${id}-nombre-${producto.id}`}
                  className="formulario-requisicion__input"
                  type="text"
                  placeholder="Ej: Papel bond tamaño carta"
                  aria-label={`Nombre del producto ${indice + 1}`}
                  maxLength={120}
                  autoFocus={indice === 0}
                  value={producto.nombre}
                  aria-invalid={Boolean(error?.nombre)}
                  onChange={(event) =>
                    cambiarProducto(producto.id, "nombre", event.target.value)
                  }
                />
                {error?.nombre && (
                  <span role="alert" className="formulario-requisicion__error">
                    {error.nombre}
                  </span>
                )}
              </div>
              <div className="formulario-requisicion__campo">
                <input
                  id={`${id}-cantidad-${producto.id}`}
                  className="formulario-requisicion__input"
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  aria-label={`Cantidad del producto ${indice + 1}`}
                  maxLength={5}
                  value={producto.cantidad}
                  aria-invalid={Boolean(error?.cantidad)}
                  onChange={(event) =>
                    cambiarProducto(producto.id, "cantidad", event.target.value)
                  }
                />
                {error?.cantidad && (
                  <span role="alert" className="formulario-requisicion__error">
                    {error.cantidad}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="formulario-requisicion__quitar"
                aria-label={`Quitar producto ${indice + 1}`}
                disabled={datos.productos.length === 1}
                onClick={() => quitarProducto(producto.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
        <button
          type="button"
          className="formulario-requisicion__agregar"
          onClick={agregarProducto}
        >
          <Plus size={16} />
          Agregar producto
        </button>
      </div>

      <div className="formulario-requisicion__campo">
        <label
          className="formulario-requisicion__etiqueta"
          htmlFor={`${id}-motivo`}
        >
          Motivo de la requisición
        </label>
        <textarea
          id={`${id}-motivo`}
          className="formulario-requisicion__input formulario-requisicion__motivo"
          rows={3}
          maxLength={300}
          placeholder="Explica por qué se necesitan estos productos"
          value={datos.motivo}
          aria-invalid={Boolean(errores.motivo)}
          onChange={(event) => cambiarMotivo(event.target.value)}
        />
        {errores.motivo && (
          <span role="alert" className="formulario-requisicion__error">
            {errores.motivo}
          </span>
        )}
      </div>

      <div className="formulario-requisicion__pie">
        <button type="submit" className="formulario-requisicion__guardar">
          Registrar requisición
        </button>
      </div>
    </form>
  );
}
