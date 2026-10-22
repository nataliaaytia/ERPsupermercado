
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

  const registroPendiente = useRef<{
    cantidadOfertas: number;
    proveedorId: number;
  } | null>(null);

  // SCRUM-407: calcular el plazo de recepción de ofertas.
  const plazo = calcularPlazoCotizacion(solicitud.fechaLimite, hoy);
  const plazoVencido = !plazo.puedeRegistrar;

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
  }, [ofertas]);

  const registrarOferta = () => {
    // SCRUM-407: impedir el registro después del vencimiento.
    if (plazoVencido) return;

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
        precio: Number(precios[detalle.producto.idProducto] ?? ""),
        plazoEntrega: Number(plazos[detalle.producto.idProducto] ?? ""),
      })),
    });
  };

  return (
    <>
      <h2>Registrar oferta del proveedor</h2>

      {/* SCRUM-407: estado visual y fechas de la cotización. */}
      <EstadoPlazoCotizacion
        fechaInicio={solicitud.fecha}
        fechaLimite={solicitud.fechaLimite}
        hoy={hoy}
      />

      <label>
        Proveedor{" "}
        <select
          value={proveedorId}
          onChange={(e) => setProveedorId(e.target.value)}
          disabled={plazoVencido}
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

      <label>
        Oferta válida hasta
        <input
          className="formulario-requisicion__input"
          type="date"
          min={hoy}
          value={validez}
          onChange={(e) => setValidez(e.target.value)}
          disabled={plazoVencido}
        />
      </label>

      <label>
        Descuento ofrecido (%)
        <input
          className="formulario-requisicion__input"
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={descuento}
          onChange={(e) => setDescuento(e.target.value)}
          disabled={plazoVencido}
        />
      </label>

      <label>
        Condiciones de entrega
        <textarea
          className="formulario-requisicion__input"
          value={condicionesEntrega}
          onChange={(e) => setCondicionesEntrega(e.target.value)}
          placeholder="Ej.: entrega en almacén, embalaje incluido y transporte a cargo del proveedor"
          rows={3}
          maxLength={500}
          required
          disabled={plazoVencido}
        />
      </label>

      {requisicion.detalles.map((detalle) => (
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
              className="formulario-requisicion__input"
              type="number"
              min="0.01"
              step="0.01"
              value={precios[detalle.producto.idProducto] ?? ""}
              onChange={(e) =>
                setPrecios((actuales) => ({
                  ...actuales,
                  [detalle.producto.idProducto]: e.target.value,
                }))
              }
            />
          </label>

          <label>
            Plazo de entrega (días)
            <input
              className="formulario-requisicion__input"
              type="number"
              min="1"
              step="1"
              value={plazos[detalle.producto.idProducto] ?? ""}
              onChange={(e) =>
                setPlazos((actuales) => ({
                  ...actuales,
                  [detalle.producto.idProducto]: e.target.value,
                }))
              }
            />
          </label>
        </fieldset>
      ))}

      <button
        type="button"
        className="selector-proveedores-boton"
        disabled={
          plazoVencido ||
          !proveedorId ||
          !validez ||
          !condicionesEntrega.trim()
        }
        onClick={registrarOferta}
      >
        {plazoVencido
          ? "Registro de ofertas deshabilitado"
          : "Registrar oferta"}
      </button>
    </>
  );
}
