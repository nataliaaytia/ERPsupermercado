import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRequisiciones } from "../requisicionesCotizaciones/useRequisiciones";
import {
  cargarOrdenesCompra,
  guardarOrdenesCompra,
} from "./compromisosEntrega";
import SolicitudAprobacionOrden from "./SolicitudAprobacionOrden";
import type { DetalleOrdenCompra } from "./tipos";
import "./GestionOrdenesBorrador.css";

type LineaEditable = DetalleOrdenCompra & {
  cantidadTexto: string;
};

const redondear = (numero: number) =>
  Number(numero.toFixed(2));

const moneda = (numero: number) =>
  numero.toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function errorCantidad(valor: string): string {
  if (valor.trim() === "") {
    return "Ingresa la cantidad del producto.";
  }

  const cantidad = Number(valor);

  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    return "Ingresa una cantidad mayor que cero para este producto.";
  }

  if (!Number.isSafeInteger(cantidad)) {
    return "Ingresa una cantidad sin decimales.";
  }

  return "";
}

export default function GestionOrdenesBorrador() {
  const { ordenes, ofertas, errorCarga } = useRequisiciones();

  const [idOrden, setIdOrden] = useState("");
  const [lineas, setLineas] = useState<LineaEditable[]>([]);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [guardando, setGuardando] = useState(false);

  const orden = ordenes.find(
    item => String(item.idOrden) === idOrden
  );

  const editable = orden?.estado === "Borrador";

  const oferta = ofertas.find(
    item => item.idOferta === orden?.idOfertaOrigen
  );

  const descuento = oferta?.descuento ?? 0;
  const catalogoCotizado = oferta?.detalles ?? [];

  const ofertaValida = Boolean(
    oferta &&
    oferta.estado === "Seleccionada" &&
    Number.isFinite(descuento) &&
    descuento >= 0 &&
    descuento <= 100
  );

  useEffect(() => {
    setLineas(
      orden?.detalles.map(detalle => ({
        ...detalle,
        cantidadTexto: String(detalle.cantidad),
      })) ?? []
    );

    setError("");
    setExito("");
  }, [orden?.idOrden, orden?.detalles]);

  function calcularSubtotal(linea: LineaEditable): number {
    const cantidad = Number(linea.cantidadTexto);

    if (
      !Number.isSafeInteger(cantidad) ||
      cantidad <= 0 ||
      !Number.isFinite(linea.precio) ||
      linea.precio <= 0
    ) {
      return 0;
    }

    return redondear(
      cantidad * linea.precio * (1 - descuento / 100)
    );
  }

  const total = redondear(
    lineas.reduce(
      (acumulado, linea) =>
        acumulado + calcularSubtotal(linea),
      0
    )
  );

  const cambios = Boolean(
    orden &&
    (
      lineas.length !== orden.detalles.length ||
      lineas.some((linea, indice) =>
        linea.idDetalle !== orden.detalles[indice]?.idDetalle ||
        linea.producto.idProducto !==
          orden.detalles[indice]?.producto.idProducto ||
        linea.cantidadTexto !==
          String(orden.detalles[indice]?.cantidad)
      )
    )
  );

  function actualizarLinea(
    idDetalle: number,
    campo: "cantidadTexto" | "producto",
    valor: string
  ) {
    if (!editable) return;

    setError("");
    setExito("");

    setLineas(actual =>
      actual.map(linea => {
        if (linea.idDetalle !== idDetalle) {
          return linea;
        }

        if (campo === "cantidadTexto") {
          return {
            ...linea,
            cantidadTexto: valor,
          };
        }

        const cotizado = catalogoCotizado.find(
          producto =>
            String(producto.producto.idProducto) === valor
        );

        if (!cotizado) {
          return linea;
        }

        return {
          ...linea,
          producto: cotizado.producto,
          precio: cotizado.precio,
        };
      })
    );
  }

  function agregarLinea() {
    if (!editable) return;

    const disponible = catalogoCotizado.find(
      producto =>
        !lineas.some(
          linea =>
            linea.producto.idProducto ===
            producto.producto.idProducto
        )
    );

    if (!disponible) return;

    setLineas(actual => [
      ...actual,
      {
        idDetalle:
          actual.reduce(
            (maximo, linea) =>
              Math.max(maximo, linea.idDetalle),
            0
          ) + 1,
        producto: disponible.producto,
        precio: disponible.precio,
        cantidad: 1,
        cantidadTexto: "1",
        subtotal: 0,
      },
    ]);

    setError("");
    setExito("");
  }

  function quitarLinea(idDetalle: number) {
    if (!editable) return;

    setLineas(actual =>
      actual.filter(linea => linea.idDetalle !== idDetalle)
    );

    setError("");
    setExito("");
  }

  function descartarCambios() {
    if (!orden || !editable) return;

    setLineas(
      orden.detalles.map(detalle => ({
        ...detalle,
        cantidadTexto: String(detalle.cantidad),
      }))
    );

    setError("");
    setExito("");
  }

  function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    setError("");
    setExito("");

    if (guardando) return;

    if (!orden || !editable || !ofertaValida) {
      setError(
        "Selecciona una orden en borrador con una oferta válida."
      );
      return;
    }

    if (lineas.length === 0) {
      setError("La orden debe tener al menos un producto.");
      return;
    }

    const cantidadesInvalidas = lineas.some(
      linea =>
        !/^\d+$/.test(linea.cantidadTexto) ||
        !Number.isSafeInteger(Number(linea.cantidadTexto)) ||
        Number(linea.cantidadTexto) <= 0
    );

    if (cantidadesInvalidas) {
      setError(
        "Revisa las cantidades marcadas antes de guardar."
      );
      return;
    }

    const productosUnicos = new Set(
      lineas.map(linea => linea.producto.idProducto)
    );

    if (productosUnicos.size !== lineas.length) {
      setError(
        "No puedes repetir el mismo producto en dos líneas."
      );
      return;
    }

    const productosInvalidos = lineas.some(
      linea =>
        !catalogoCotizado.some(
          cotizado =>
            cotizado.producto.idProducto ===
              linea.producto.idProducto &&
            cotizado.precio === linea.precio
        )
    );

    if (productosInvalidos) {
      setError(
        "Solo se permiten productos y precios de la oferta adjudicada."
      );
      return;
    }

    const detalles: DetalleOrdenCompra[] = lineas.map(
      linea => ({
        idDetalle: linea.idDetalle,
        producto: linea.producto,
        precio: linea.precio,
        cantidad: Number(linea.cantidadTexto),
        subtotal: calcularSubtotal(linea),
        ...(linea.compromisos
          ? { compromisos: linea.compromisos }
          : {}),
      })
    );

    setGuardando(true);

    try {
      const actuales = cargarOrdenesCompra();

      const vigente = actuales.find(
        item => item.idOrden === orden.idOrden
      );

      if (!vigente || vigente.estado !== "Borrador") {
        throw new Error(
          "La orden ya no está en borrador o fue eliminada."
        );
      }

      if (vigente.idOfertaOrigen !== orden.idOfertaOrigen) {
        throw new Error(
          "La oferta de origen cambió. Recarga la página."
        );
      }

      if (
        vigente.detalles.some(
          detalle =>
            (detalle.compromisos?.length ?? 0) > 0
        )
      ) {
        throw new Error(
          "No se puede editar una orden con compromisos registrados."
        );
      }

      const totalActualizado = redondear(
        detalles.reduce(
          (acumulado, detalle) =>
            acumulado + detalle.subtotal,
          0
        )
      );

      guardarOrdenesCompra(
        actuales.map(item =>
          item.idOrden === vigente.idOrden
            ? {
                ...item,
                detalles,
                total: totalActualizado,
              }
            : item
        )
      );

      setExito(
        `Los cambios de ${vigente.numero} se guardaron correctamente.`
      );
    } catch (fallo) {
      setError(
        fallo instanceof Error
          ? fallo.message
          : "No se pudieron guardar los cambios."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="borrador-editor">
      <header className="borrador-editor__encabezado">
        <h2>Consultar y editar órdenes de compra</h2>
        <p>
          Consulta las órdenes registradas y modifica las que estén
          en borrador antes de solicitar aprobación.
        </p>
      </header>

      {errorCarga && (
        <p
          className="borrador-editor__error"
          role="alert"
        >
          {errorCarga}
        </p>
      )}

      <label className="borrador-editor__campo">
        Orden de compra

        <select
          value={idOrden}
          disabled={Boolean(errorCarga)}
          onChange={evento =>
            setIdOrden(evento.target.value)
          }
        >
          <option value="">
            Selecciona una orden
          </option>

          {ordenes.map(item => (
            <option
              key={item.idOrden}
              value={item.idOrden}
            >
              {item.numero} · {item.estado} ·{" "}
              {item.detalles.length} productos
            </option>
          ))}
        </select>
      </label>

      {ordenes.length === 0 && !errorCarga && (
        <p className="borrador-editor__aviso">
          Todavía no hay órdenes de compra registradas.
        </p>
      )}

      {orden && (
        <form onSubmit={guardar} noValidate>
          <div className="borrador-editor__resumen">
            <span>
              <strong>Orden:</strong> {orden.numero}
            </span>

            <span>
              <strong>Estado:</strong> {orden.estado}
            </span>

            <span>
              <strong>Oferta de origen:</strong>{" "}
              {orden.idOfertaOrigen
                ? `#${orden.idOfertaOrigen}`
                : "No disponible"}
            </span>

            <span>
              <strong>Descuento:</strong>{" "}
              {ofertaValida
                ? `${descuento}%`
                : "No disponible"}
            </span>
          </div>

          {!editable && (
            <p
              className="borrador-editor__aviso"
              role="status"
            >
              Esta orden está en estado {orden.estado} y solo
              puede consultarse. Únicamente las órdenes en
              borrador pueden modificarse.
            </p>
          )}

          {editable && !ofertaValida && (
            <p
              className="borrador-editor__error"
              role="alert"
            >
              No se encontró la oferta adjudicada o su
              descuento es inválido. No se puede editar
              esta orden.
            </p>
          )}

          <div className="borrador-editor__tabla">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio unitario</th>
                  <th>Subtotal con descuento</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {lineas.map(linea => (
                  <tr key={linea.idDetalle}>
                    <td>
                      <select
                        aria-label={`Producto de línea ${linea.idDetalle}`}
                        value={linea.producto.idProducto}
                        disabled={
                          !editable || !ofertaValida
                        }
                        onChange={evento =>
                          actualizarLinea(
                            linea.idDetalle,
                            "producto",
                            evento.target.value
                          )
                        }
                      >
                        {!editable ? (
                          <option
                            value={linea.producto.idProducto}
                          >
                            {linea.producto.descripcion}
                          </option>
                        ) : catalogoCotizado
                          .filter(
                            producto =>
                              producto.producto.idProducto ===
                                linea.producto.idProducto ||
                              !lineas.some(
                                otra =>
                                  otra.producto.idProducto ===
                                  producto.producto.idProducto
                              )
                          )
                          .map(producto => (
                            <option
                              key={
                                producto.producto.idProducto
                              }
                              value={
                                producto.producto.idProducto
                              }
                            >
                              {producto.producto.descripcion}
                            </option>
                          ))}
                      </select>
                    </td>

                    <td>
                      <input
                        aria-label={`Cantidad de línea ${linea.idDetalle}`}
                        aria-invalid={Boolean(
                          errorCantidad(linea.cantidadTexto)
                        )}
                        aria-describedby={
                          editable &&
                          errorCantidad(linea.cantidadTexto)
                            ? `error-cantidad-${linea.idDetalle}`
                            : undefined
                        }
                        className={
                          editable &&
                          errorCantidad(linea.cantidadTexto)
                            ? "borrador-editor__input-invalido"
                            : ""
                        }
                        type="number"
                        min="1"
                        step="1"
                        value={linea.cantidadTexto}
                        disabled={
                          !editable || !ofertaValida
                        }
                        onChange={evento =>
                          actualizarLinea(
                            linea.idDetalle,
                            "cantidadTexto",
                            evento.target.value
                          )
                        }
                      />

                      {errorCantidad(linea.cantidadTexto) && (
                        <span
                          id={`error-cantidad-${linea.idDetalle}`}
                          className="borrador-editor__mensaje-cantidad"
                        >
                          {errorCantidad(linea.cantidadTexto)}
                        </span>
                      )}
                    </td>

                    <td>
                      Bs {moneda(linea.precio)}
                    </td>

                    <td>
                      Bs{" "}
                      {moneda(
                        editable
                          ? calcularSubtotal(linea)
                          : linea.subtotal
                      )}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="borrador-editor__quitar"
                        disabled={
                          !editable ||
                          !ofertaValida ||
                          lineas.length === 1
                        }
                        onClick={() =>
                          quitarLinea(linea.idDetalle)
                        }
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="borrador-editor__pie">
            <button
              type="button"
              className="borrador-editor__secundario"
              disabled={
                !editable ||
                !ofertaValida ||
                catalogoCotizado.every(producto =>
                  lineas.some(
                    linea =>
                      linea.producto.idProducto ===
                      producto.producto.idProducto
                  )
                )
              }
              onClick={agregarLinea}
            >
              + Agregar producto cotizado
            </button>

            <strong>
              Total: Bs{" "}
              {moneda(
                editable ? total : orden.total
              )}
            </strong>
          </div>

          {error && (
            <p
              className="borrador-editor__error"
              role="alert"
            >
              {error}
            </p>
          )}

          {exito && (
            <p
              className="borrador-editor__exito"
              role="status"
            >
              {exito}
            </p>
          )}

          <div className="borrador-editor__acciones">
            <button
              type="submit"
              disabled={
                !editable ||
                !cambios ||
                !ofertaValida ||
                guardando ||
                Boolean(errorCarga)
              }
            >
              {guardando
                ? "Guardando..."
                : "Guardar cambios"}
            </button>

            <button
              type="button"
              className="borrador-editor__secundario"
              disabled={
                !editable || !cambios
              }
              onClick={descartarCambios}
            >
              Descartar cambios
            </button>
            {editable && (
              <SolicitudAprobacionOrden
                idOrden={orden.idOrden}
                deshabilitado={
                  cambios ||
                  guardando ||
                  Boolean(errorCarga) ||
                  !ofertaValida
                }
              />
            )}
          </div>
        </form>
      )}
    </section>
  );
}
