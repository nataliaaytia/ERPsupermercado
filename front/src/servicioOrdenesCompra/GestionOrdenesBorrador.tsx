
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRequisiciones } from "../requisicionesCotizaciones/useRequisiciones";
import {
  cargarOrdenesCompra,
  guardarOrdenesCompra,
} from "./compromisosEntrega";
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

  const borradores = useMemo(
    () => ordenes.filter(orden => orden.estado === "Borrador"),
    [ordenes]
  );

  const orden = borradores.find(
    item => String(item.idOrden) === idOrden
  );

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
    setLineas(actual =>
      actual.filter(linea => linea.idDetalle !== idDetalle)
    );

    setError("");
    setExito("");
  }

  function descartarCambios() {
    if (!orden) return;

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

    if (!orden || !ofertaValida) {
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
      setError("Revisa las cantidades marcadas antes de guardar.");
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
          detalle => (detalle.compromisos?.length ?? 0) > 0
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
        <h2>Editar orden en borrador</h2>
        <p>
          Modifica productos cotizados y cantidades antes de
          solicitar aprobación.
        </p>
      </header>

      {errorCarga && (
        <p className="borrador-editor__error" role="alert">
          {errorCarga}
        </p>
      )}

      <label className="borrador-editor__campo">
        Orden en borrador
        <select
          value={idOrden}
          disabled={Boolean(errorCarga)}
          onChange={evento =>
            setIdOrden(evento.target.value)
          }
        >
          <option value="">Selecciona una orden</option>

          {borradores.map(item => (
            <option
              key={item.idOrden}
              value={item.idOrden}
            >
              {item.numero} · {item.detalles.length} productos
            </option>
          ))}
        </select>
      </label>

      {borradores.length === 0 && !errorCarga && (
        <p className="borrador-editor__aviso">
          Todavía no hay órdenes en borrador para editar.
        </p>
      )}

      {orden && (
        <form onSubmit={guardar} noValidate>
          <div className="borrador-editor__resumen">
            <span>
              <strong>Orden:</strong> {orden.numero}
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

          {!ofertaValida && (
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
                        disabled={!ofertaValida}
                        onChange={evento =>
                          actualizarLinea(
                            linea.idDetalle,
                            "producto",
                            evento.target.value
                          )
                        }
                      >
                        {catalogoCotizado
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
                              key={producto.producto.idProducto}
                              value={producto.producto.idProducto}
                            >
                              {producto.producto.descripcion}
                            </option>
                          ))}
                      </select>
                    </td>

                    <td>
                      <input
                        aria-label={`Cantidad de línea ${linea.idDetalle}`}
                        aria-invalid={Boolean(errorCantidad(linea.cantidadTexto))}
                        aria-describedby={
                          errorCantidad(linea.cantidadTexto)
                            ? `error-cantidad-${linea.idDetalle}`
                            : undefined
                        }
                        className={
                          errorCantidad(linea.cantidadTexto)
                            ? "borrador-editor__input-invalido"
                            : ""
                        }
                        type="number"
                        min="1"
                        step="1"
                        value={linea.cantidadTexto}
                        disabled={!ofertaValida}
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

                    <td>Bs {moneda(linea.precio)}</td>

                    <td>
                      Bs {moneda(calcularSubtotal(linea))}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="borrador-editor__quitar"
                        disabled={
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

            <strong>Total: Bs {moneda(total)}</strong>
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
              disabled={!cambios}
              onClick={descartarCambios}
            >
              Descartar cambios
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
