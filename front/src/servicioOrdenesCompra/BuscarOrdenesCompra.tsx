import { useMemo, useState } from "react";
import { useRequisiciones } from "../requisicionesCotizaciones/useRequisiciones";
import "./BuscarOrdenesCompra.css";

interface Props {
  onVerDetalle: (idOrden: number) => void;
}

const TAMANO_PAGINA = 20;

function moneda(valor: number): string {
  return `Bs ${valor.toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function BuscarOrdenesCompra({
  onVerDetalle,
}: Props) {
  const { ordenes, ofertas, errorCarga } = useRequisiciones();

  const [numero, setNumero] = useState("");
  const [proveedor, setProveedor] = useState("");
  const [estado, setEstado] = useState("");
  const [pagina, setPagina] = useState(1);

  const proveedoresPorOferta = useMemo(
    () =>
      new Map(
        ofertas.map((oferta) => [
          oferta.idOferta,
          oferta.proveedor?.razonSocial ?? "",
        ])
      ),
    [ofertas]
  );

  const estados = useMemo(
    () =>
      [...new Set(ordenes.map((orden) => orden.estado))]
        .filter(Boolean)
        .sort(),
    [ordenes]
  );

  const ordenesFiltradas = useMemo(() => {
    const numeroBuscado = numero.trim().toLowerCase();
    const proveedorBuscado = proveedor.trim().toLowerCase();

    return ordenes.filter((orden) => {
      const nombreProveedor =
        proveedoresPorOferta.get(orden.idOfertaOrigen ?? -1) ?? "";

      return (
        orden.numero.toLowerCase().includes(numeroBuscado) &&
        nombreProveedor.toLowerCase().includes(proveedorBuscado) &&
        (!estado || orden.estado === estado)
      );
    });
  }, [ordenes, proveedoresPorOferta, numero, proveedor, estado]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(ordenesFiltradas.length / TAMANO_PAGINA)
  );

  const paginaActual = Math.min(pagina, totalPaginas);

  const ordenesPagina = ordenesFiltradas.slice(
    (paginaActual - 1) * TAMANO_PAGINA,
    paginaActual * TAMANO_PAGINA
  );

  function limpiarFiltros() {
    setNumero("");
    setProveedor("");
    setEstado("");
    setPagina(1);
  }

  return (
    <section className="buscar-ordenes">
      <div className="buscar-ordenes__encabezado">
        <div>
          <h2>Buscar órdenes de compra</h2>
          <p>
            Consulta las órdenes registradas y accede a sus detalles.
          </p>
        </div>
      </div>

      <div className="buscar-ordenes__filtros">
        <div className="buscar-ordenes__campo">
          <label htmlFor="buscar-orden-numero">
            Número de orden
          </label>
          <input
            id="buscar-orden-numero"
            type="search"
            placeholder="Ej. OC-0006"
            value={numero}
            onChange={(e) => { setNumero(e.target.value); setPagina(1); }}
          />
        </div>

        <div className="buscar-ordenes__campo">
          <label htmlFor="buscar-orden-proveedor">
            Proveedor
          </label>
          <input
            id="buscar-orden-proveedor"
            type="search"
            placeholder="Nombre del proveedor"
            value={proveedor}
            onChange={(e) => { setProveedor(e.target.value); setPagina(1); }}
          />
        </div>

        <div className="buscar-ordenes__campo">
          <label htmlFor="buscar-orden-estado">
            Estado
          </label>
          <select
            id="buscar-orden-estado"
            value={estado}
            onChange={(e) => { setEstado(e.target.value); setPagina(1); }}
          >
            <option value="">Todos los estados</option>
            {estados.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="buscar-ordenes__limpiar"
          onClick={limpiarFiltros}
          disabled={!numero && !proveedor && !estado}
        >
          Limpiar filtros
        </button>
      </div>

      {errorCarga ? (
        <p className="buscar-ordenes__error" role="alert">
          {errorCarga}
        </p>
      ) : (
        <>
          <div className="buscar-ordenes__resultados">
            <h3>Órdenes registradas</h3>
            <span>
              {ordenesFiltradas.length}{" "}
              {ordenesFiltradas.length === 1
                ? "resultado"
                : "resultados"}
            </span>
          </div>

          {ordenesFiltradas.length === 0 ? (
            <div className="buscar-ordenes__vacio">
              <p>No se encontraron órdenes con los filtros aplicados.</p>
              <button type="button" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            </div>
          ) : (
            <>
              <div className="buscar-ordenes__tabla-contenedor">
                <table className="buscar-ordenes__tabla">
                  <thead>
                    <tr>
                      <th>Número</th>
                      <th>Proveedor</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Total</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenesPagina.map((orden) => (
                      <tr key={orden.idOrden}>
                        <td>
                          <strong>{orden.numero}</strong>
                        </td>
                        <td>
                          {proveedoresPorOferta.get(
                            orden.idOfertaOrigen ?? -1
                          ) || "No disponible"}
                        </td>
                        <td>{orden.fecha || "No registrada"}</td>
                        <td>
                          <span className="buscar-ordenes__estado">
                            {orden.estado}
                          </span>
                        </td>
                        <td>{moneda(orden.total)}</td>
                        <td>
                          <button
                            type="button"
                            className="buscar-ordenes__detalle"
                            onClick={() => onVerDetalle(orden.idOrden)}
                            aria-label={`Ver detalle de ${orden.numero}`}
                          >
                            Ver detalle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="buscar-ordenes__paginacion">
                <span>
                  Mostrando{" "}
                  {(paginaActual - 1) * TAMANO_PAGINA + 1}–
                  {Math.min(
                    paginaActual * TAMANO_PAGINA,
                    ordenesFiltradas.length
                  )}{" "}
                  de {ordenesFiltradas.length}
                </span>

                <div className="buscar-ordenes__paginacion-controles">
                  <button
                    type="button"
                    disabled={paginaActual === 1}
                    onClick={() => setPagina(paginaActual - 1)}
                  >
                    Anterior
                  </button>

                  <span>
                    Página {paginaActual} de {totalPaginas}
                  </span>

                  <button
                    type="button"
                    disabled={paginaActual === totalPaginas}
                    onClick={() => setPagina(paginaActual + 1)}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
