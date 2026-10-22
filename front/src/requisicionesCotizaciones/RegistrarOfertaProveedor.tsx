
import { useEffect, useRef, useState } from "react";
import type { Dispatch } from "react";

import type { AccionCompras, EstadoCompras } from "./modeloCompras";
import type { ProveedorReferencia } from "./tipos";

import EstadoPlazoCotizacion from "./EstadoPlazoCotizacion";
import { calcularPlazoCotizacion } from "./plazoCotizacion";

interface Props {
  solicitud: EstadoCompras["solicitudes"][number];
  requisicion: EstadoCompras["requisiciones"][number];
  invitados: ProveedorReferencia[];
  ofertas: EstadoCompras["ofertas"];
  hoy: string;
  dispatch: Dispatch<AccionCompras>;
}

type ErroresFormulario = Record<string, string>;

export default function RegistrarOfertaProveedor({
  solicitud,
  requisicion,
  invitados,
  ofertas,
  hoy,
  dispatch,
}: Props) {
  const [proveedorId, setProveedorId] = useState("");
  const [validez, setValidez] = useState("");
  const [descuento, setDescuento] = useState("0");
  const [condicionesEntrega, setCondicionesEntrega] = useState("");

  const [precios, setPrecios] = useState<Record<number, string>>({});
  const [plazos, setPlazos] = useState<Record<number, string>>({});
  const [errores, setErrores] = useState<ErroresFormulario>({});

  const formularioRef = useRef<HTMLFormElement>(null);

  const registroPendiente = useRef<{
    cantidadOfertas: number;
    proveedorId: number;
  } | null>(null);

  const plazo = calcularPlazoCotizacion(solicitud.fechaLimite, hoy);

  const plazoVencido =
    !plazo.puedeRegistrar || solicitud.estado !== "Enviada";

  useEffect(() => {
    const pendiente = registroPendiente.current;

    if (!pendiente) return;

    const ofertaRegistrada =
      ofertas.length > pendiente.cantidadOfertas &&
      ofertas.some(
        (oferta) =>
          oferta.proveedor.idProveedor === pendiente.proveedorId,
      );

    if (!ofertaRegistrada) return;

    registroPendiente.current = null;

    setProveedorId("");
    setValidez("");
    setDescuento("0");
    setCondicionesEntrega("");
    setPrecios({});
    setPlazos({});
    setErrores({});
  }, [ofertas]);

  const limpiarError = (campo: string) => {
    setErrores((actuales) => {
      if (!actuales[campo]) return actuales;

      const nuevos = { ...actuales };
      delete nuevos[campo];

      return nuevos;
    });
  };

  const validarFormulario = (): ErroresFormulario => {
    const nuevosErrores: ErroresFormulario = {};

    const proveedor = invitados.find(
      (p) => p.idProveedor === Number(proveedorId),
    );

    if (!proveedorId || !proveedor) {
      nuevosErrores.proveedor = "Selecciona un proveedor válido.";
    } else if (
      ofertas.some(
        (oferta) =>
          oferta.proveedor.idProveedor === proveedor.idProveedor &&
          oferta.estado !== "Rechazada",
      )
    ) {
      nuevosErrores.proveedor =
        "Este proveedor ya tiene una oferta registrada para esta solicitud.";
    }

    if (!validez) {
      nuevosErrores.validez =
        "Selecciona la fecha de validez de la oferta.";
    } else if (validez < hoy) {
      nuevosErrores.validez =
        "La fecha de validez no puede ser anterior a hoy.";
    }

    const descuentoNumero = Number(descuento);

    if (descuento.trim() === "") {
      nuevosErrores.descuento = "Ingresa el descuento ofrecido.";
    } else if (
      !Number.isFinite(descuentoNumero) ||
      descuentoNumero < 0 ||
      descuentoNumero > 100
    ) {
      nuevosErrores.descuento =
        "El descuento debe estar entre 0 y 100%.";
    }

    if (!condicionesEntrega.trim()) {
      nuevosErrores.condiciones =
        "Ingresa las condiciones de entrega.";
    } else if (condicionesEntrega.trim().length > 500) {
      nuevosErrores.condiciones =
        "Las condiciones no pueden superar los 500 caracteres.";
    }

    requisicion.detalles.forEach((detalle) => {
      const id = detalle.producto.idProducto;
      const precioTexto = precios[id] ?? "";
      const plazoTexto = plazos[id] ?? "";

      const precio = Number(precioTexto);
      const plazoEntrega = Number(plazoTexto);

      if (precioTexto.trim() === "") {
        nuevosErrores[`precio-${id}`] =
          "Ingresa el precio unitario.";
      } else if (
        !Number.isFinite(precio) ||
        precio <= 0 ||
        precio > 100000
      ) {
        nuevosErrores[`precio-${id}`] =
          "El precio debe ser mayor que 0 y no superar Bs 100.000.";
      } else if (!Number.isInteger(precio * 100)) {
        nuevosErrores[`precio-${id}`] =
          "El precio admite como máximo dos decimales.";
      }

      if (plazoTexto.trim() === "") {
        nuevosErrores[`plazo-${id}`] =
          "Ingresa el plazo de entrega.";
      } else if (
        !Number.isInteger(plazoEntrega) ||
        plazoEntrega < 1
      ) {
        nuevosErrores[`plazo-${id}`] =
          "El plazo debe ser un número entero mayor que 0.";
      }
    });

    return nuevosErrores;
  };

  const registrarOferta = () => {
    if (plazoVencido) return;

    const nuevosErrores = validarFormulario();

    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      const primerCampo = Object.keys(nuevosErrores)[0];

      requestAnimationFrame(() => {
        const campo = formularioRef.current?.querySelector<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >(`[data-campo="${primerCampo}"]`);

        campo?.focus();
      });

      return;
    }

    const proveedor = invitados.find(
      (p) => p.idProveedor === Number(proveedorId),
    );

    if (!proveedor) return;

    registroPendiente.current = {
      cantidadOfertas: ofertas.length,
      proveedorId: proveedor.idProveedor,
    };

    dispatch({
      tipo: "registrarOferta",
      solicitud: solicitud.idSolicitud,
      proveedor,
      validez,
      condicionesEntrega: condicionesEntrega.trim(),
      descuento: Number(descuento),
      hoy,
      detalles: requisicion.detalles.map((detalle, i) => ({
        idDetalle: i + 1,
        producto: detalle.producto,
        precio: Number(precios[detalle.producto.idProducto]),
        plazoEntrega: Number(plazos[detalle.producto.idProducto]),
      })),
    });
  };

  return (
    <>
      <h2>Registrar oferta del proveedor</h2>

      <EstadoPlazoCotizacion
        fechaInicio={solicitud.fecha}
        fechaLimite={solicitud.fechaLimite}
        hoy={hoy}
      />

      <form
        ref={formularioRef}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          registrarOferta();
        }}
      >
        <label>
          Proveedor
          <select
            data-campo="proveedor"
            value={proveedorId}
            onChange={(e) => {
              setProveedorId(e.target.value);
              limpiarError("proveedor");
            }}
            disabled={plazoVencido}
            aria-invalid={Boolean(errores.proveedor)}
          >
            <option value="">Seleccionar proveedor</option>

            {invitados.map((proveedor) => (
              <option
                key={proveedor.idProveedor}
                value={proveedor.idProveedor}
              >
                {proveedor.razonSocial}
              </option>
            ))}
          </select>
        </label>

        {errores.proveedor && (
          <p role="alert" className="formulario-requisicion__error">
            {errores.proveedor}
          </p>
        )}

        <label>
          Oferta válida hasta
          <input
            data-campo="validez"
            className="formulario-requisicion__input"
            type="date"
            min={hoy}
            value={validez}
            onChange={(e) => {
              setValidez(e.target.value);
              limpiarError("validez");
            }}
            disabled={plazoVencido}
            aria-invalid={Boolean(errores.validez)}
          />
        </label>

        {errores.validez && (
          <p role="alert" className="formulario-requisicion__error">
            {errores.validez}
          </p>
        )}

        <label>
          Descuento ofrecido (%)
          <input
            data-campo="descuento"
            className="formulario-requisicion__input"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={descuento}
            onChange={(e) => {
              setDescuento(e.target.value);
              limpiarError("descuento");
            }}
            disabled={plazoVencido}
            aria-invalid={Boolean(errores.descuento)}
          />
        </label>

        {errores.descuento && (
          <p role="alert" className="formulario-requisicion__error">
            {errores.descuento}
          </p>
        )}

        <label>
          Condiciones de entrega
          <textarea
            data-campo="condiciones"
            className="formulario-requisicion__input"
            value={condicionesEntrega}
            onChange={(e) => {
              setCondicionesEntrega(e.target.value);
              limpiarError("condiciones");
            }}
            placeholder="Ej.: entrega en almacén, embalaje incluido y transporte a cargo del proveedor"
            rows={3}
            maxLength={500}
            disabled={plazoVencido}
            aria-invalid={Boolean(errores.condiciones)}
          />
        </label>

        {errores.condiciones && (
          <p role="alert" className="formulario-requisicion__error">
            {errores.condiciones}
          </p>
        )}

        {requisicion.detalles.map((detalle) => {
          const id = detalle.producto.idProducto;

          return (
            <fieldset
              key={detalle.idDetalle}
              disabled={plazoVencido}
            >
              <legend>
                {detalle.producto.descripcion}
                {" · "}
                Cantidad: {detalle.cantidad}
              </legend>

              <label>
                Precio unitario (Bs)
                <input
                  data-campo={`precio-${id}`}
                  className="formulario-requisicion__input"
                  type="number"
                  min="0.01"
                  max="100000"
                  step="0.01"
                  value={precios[id] ?? ""}
                  onChange={(e) => {
                    setPrecios((actuales) => ({
                      ...actuales,
                      [id]: e.target.value,
                    }));

                    limpiarError(`precio-${id}`);
                  }}
                  aria-invalid={Boolean(errores[`precio-${id}`])}
                />
              </label>

              {errores[`precio-${id}`] && (
                <p
                  role="alert"
                  className="formulario-requisicion__error"
                >
                  {errores[`precio-${id}`]}
                </p>
              )}

              <label>
                Plazo de entrega (días)
                <input
                  data-campo={`plazo-${id}`}
                  className="formulario-requisicion__input"
                  type="number"
                  min="1"
                  step="1"
                  value={plazos[id] ?? ""}
                  onChange={(e) => {
                    setPlazos((actuales) => ({
                      ...actuales,
                      [id]: e.target.value,
                    }));

                    limpiarError(`plazo-${id}`);
                  }}
                  aria-invalid={Boolean(errores[`plazo-${id}`])}
                />
              </label>

              {errores[`plazo-${id}`] && (
                <p
                  role="alert"
                  className="formulario-requisicion__error"
                >
                  {errores[`plazo-${id}`]}
                </p>
              )}
            </fieldset>
          );
        })}

        {Object.keys(errores).length > 0 && !plazoVencido && (
          <p role="alert" className="formulario-requisicion__error">
            Revisa los campos señalados antes de registrar la oferta.
          </p>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "12px",
          }}
        >
          <button
            type="submit"
            className="selector-proveedores-boton"
            disabled={plazoVencido}
          >
            {plazoVencido
              ? "Registro de ofertas deshabilitado"
              : "Registrar oferta"}
          </button>
        </div>
      </form>
    </>
  );
}
