import { useState, type ChangeEvent } from 'react';

import {
  Package,
  BarChart3,
  Timer,
  Truck,
  Zap
} from 'lucide-react';

import type { Proveedor } from './Catalogo';

import './ComparacionProductos.css';

interface ComparacionProductosProps {
  proveedores: Proveedor[];
}

export const ComparacionProductos = ({
  proveedores
}: ComparacionProductosProps) => {
  const [productoCompararSKU, setProductoCompararSKU] =
    useState<string>('');

  const [cantidadComparacion, setCantidadComparacion] =
    useState<string>('1');

  const [criterios, setCriterios] = useState({
    precio: true,
    descuento: true,
    entrega: true,
    stock: true
  });

  // Productos disponibles
  const todosLosProductosComparacion = proveedores.flatMap(
    (proveedor) =>
      proveedor.catalogoProductos.map((producto) => ({
        ...producto,
        proveedor
      }))
  );

  const listaProductosUnicos = Array.from(
    new Map(
      todosLosProductosComparacion.map((producto) => [
        producto.sku,
        producto
      ])
    ).values()
  );

  // Producto seleccionado
  const productoSKUSeleccionado =
    productoCompararSKU ||
    listaProductosUnicos[0]?.sku ||
    '';

  const proveedoresParaProducto =
    todosLosProductosComparacion.filter(
      (item) => item.sku === productoSKUSeleccionado
    );

  const productoActualComparativo =
    listaProductosUnicos.find(
      (producto) =>
        producto.sku === productoSKUSeleccionado
    ) ?? listaProductosUnicos[0];

  // Cantidad
  const disminuirCantidad = () => {
    const cantidad =
      Number(cantidadComparacion) || 0;

    setCantidadComparacion(
      String(Math.max(0, cantidad - 1))
    );
  };

  const aumentarCantidad = () => {
    const cantidad =
      Number(cantidadComparacion) || 0;

    setCantidadComparacion(
      String(cantidad + 1)
    );
  };

  const cambiarCantidad = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const valor = e.target.value;

    if (valor === '') {
      setCantidadComparacion('');
      return;
    }

    const numero = Number(valor);

    if (numero >= 0) {
      setCantidadComparacion(valor);
    }
  };

  const cantidadNumerica =
    cantidadComparacion === ''
      ? 0
      : Number(cantidadComparacion) || 0;

  // Criterios
  const cambiarCriterio = (
    criterio: keyof typeof criterios
  ) => {
    setCriterios((actuales) => ({
      ...actuales,
      [criterio]: !actuales[criterio]
    }));
  };

  const criteriosActivos =
    Object.values(criterios).filter(Boolean).length;

  // Stock suficiente
  const ofertasConStock =
    cantidadNumerica > 0
      ? proveedoresParaProducto.filter(
          (item) =>
            item.stockDisponible >= cantidadNumerica
        )
      : [];

  // Solo proveedores activos y con stock participan en recomendaciones
  const ofertasElegibles =
    ofertasConStock.filter(
      (item) =>
        item.proveedor.estado.toLowerCase() === 'activo'
    );

  // Precio mínimo
  const precioMinimo =
    ofertasElegibles.length > 0
      ? Math.min(
          ...ofertasElegibles.map(
            (item) => item.precioPactado
          )
        )
      : 0;

  // Convierte el tiempo de entrega a horas
  const extraerHorasMinimas = (
    tiempoStr: string
  ): number => {
    if (!tiempoStr) return 999;

    const numeros = tiempoStr.match(/\d+/g);

    if (!numeros) return 999;

    const menorNumero = Math.min(
      ...numeros.map(Number)
    );

    const texto = tiempoStr.toLowerCase();

    if (
      texto.includes('día') ||
      texto.includes('dias') ||
      texto.includes('días')
    ) {
      return menorNumero * 24;
    }

    return menorNumero;
  };

  // Entrega más rápida entre ofertas elegibles
  const menorTiempoHoras =
    ofertasElegibles.length > 0
      ? Math.min(
          ...ofertasElegibles.map((item) =>
            extraerHorasMinimas(
              item.tiempoEntregaEstimado
            )
          )
        )
      : 999;

  const mejorProveedorEntrega =
    ofertasElegibles.find(
      (item) =>
        extraerHorasMinimas(
          item.tiempoEntregaEstimado
        ) === menorTiempoHoras
    );

  const columnasTabla =
    3 +
    (criterios.precio ? 2 : 0) +
    (criterios.descuento ? 1 : 0) +
    (criterios.entrega ? 1 : 0) +
    (criterios.stock ? 1 : 0);

  return (
    <div className="catalogo-productos-layout">

      <div className="selector-proveedor-card">

        <div className="selector-header">

          <div className="comparacion-controles">

            <div className="comparacion-producto">

              <span className="selector-label">
                Seleccionar Producto a Comparar:
              </span>

              <div className="select-wrapper">

                <Package
                  size={16}
                  className="select-icon"
                />

                <select
                  className="proveedor-dropdown"
                  value={productoSKUSeleccionado}
                  onChange={(e) =>
                    setProductoCompararSKU(
                      e.target.value
                    )
                  }
                >
                  {listaProductosUnicos.map(
                    (producto) => (
                      <option
                        key={producto.sku}
                        value={producto.sku}
                      >
                        {producto.nombre} (
                        {producto.sku})
                      </option>
                    )
                  )}
                </select>

              </div>

            </div>

            <div className="cantidad-comparacion">

              <span className="selector-label">
                Cantidad a comprar:
              </span>

              <div className="cantidad-control">

                <button
                  type="button"
                  className="cantidad-boton"
                  onClick={disminuirCantidad}
                  aria-label="Disminuir cantidad"
                >
                  −
                </button>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={cantidadComparacion}
                  onChange={cambiarCantidad}
                  onWheel={(e) =>
                    e.currentTarget.blur()
                  }
                  className="cantidad-comparacion-input"
                  aria-label="Cantidad a comprar"
                />

                <button
                  type="button"
                  className="cantidad-boton"
                  onClick={aumentarCantidad}
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>

              </div>

            </div>

          </div>

          {productoActualComparativo && (
            <div className="proveedor-meta-pills">

              <span className="pill-metric">
                Categoría:{' '}
                <strong>
                  {productoActualComparativo.categoria}
                </strong>
              </span>

              <span className="pill-metric">
                Proveedores:{' '}
                <strong>
                  {proveedoresParaProducto.length}
                </strong>
              </span>

              <span className="pill-metric">
                Mejor Precio:{' '}
                <strong>
                  {cantidadNumerica > 0 &&
                  ofertasElegibles.length > 0
                    ? `${precioMinimo.toFixed(2)} Bs.`
                    : 'N/A'}
                </strong>
              </span>

              <span className="pill-metric">

                <Timer
                  size={13}
                  style={{
                    marginRight: '4px',
                    verticalAlign: 'middle'
                  }}
                />

                Menor Abastecimiento:{' '}

                <strong>
                  {cantidadNumerica > 0
                    ? mejorProveedorEntrega
                        ?.tiempoEntregaEstimado ||
                      'N/A'
                    : 'N/A'}
                </strong>

              </span>

            </div>
          )}

        </div>

      </div>

      <div className="comparacion-criterios">

        <p className="comparacion-criterios-titulo">
          Criterios de comparación
        </p>

        <div className="comparacion-criterios-opciones">

          <label>
            <input
              type="checkbox"
              checked={criterios.precio}
              onChange={() =>
                cambiarCriterio('precio')
              }
            />
            Precio
          </label>

          <label>
            <input
              type="checkbox"
              checked={criterios.descuento}
              onChange={() =>
                cambiarCriterio('descuento')
              }
            />
            Descuento por cantidad
          </label>

          <label>
            <input
              type="checkbox"
              checked={criterios.entrega}
              onChange={() =>
                cambiarCriterio('entrega')
              }
            />
            Tiempo de entrega
          </label>

          <label>
            <input
              type="checkbox"
              checked={criterios.stock}
              onChange={() =>
                cambiarCriterio('stock')
              }
            />
            Stock disponible
          </label>

        </div>

        <p className="criterios-seleccionados">
          {criteriosActivos} criterios seleccionados
        </p>

      </div>

      <div className="tabla-catalogo-card">

        <div className="tabla-header-info">

          <div className="titulo-tabla-group">

            <BarChart3
              size={18}
              className="icono-seccion"
            />

            <h3 className="titulo-tabla">
              Comparativa de Proveedores
            </h3>

          </div>

          <span className="conteo-resultados">
            Mostrando{' '}
            {proveedoresParaProducto.length}{' '}
            ofertas para comparación
          </span>

        </div>

        <div className="comparacion-tabla-scroll">

          <table className="documentos-tabla comparacion-tabla">

            <thead>

              <tr>

                <th>
                  Proveedor / RUC
                </th>

                <th>
                  Estado Proveedor
                </th>

                {criterios.precio && (
                  <>
                    <th>
                      Precio Pactado
                    </th>

                    <th>
                      Diferencia vs Mínimo
                    </th>
                  </>
                )}

                {criterios.descuento && (
                  <th>
                    Descuento por Volumen
                  </th>
                )}

                {criterios.entrega && (
                  <th>
                    Tiempo Estimado de Entrega
                  </th>
                )}

                {criterios.stock && (
                  <th>
                    Stock Dispon.
                  </th>
                )}

                <th>
                  Desempeño
                </th>

              </tr>

            </thead>

            <tbody>

              {proveedoresParaProducto.length > 0 ? (

                proveedoresParaProducto.map(
                  (item) => {

                    const stockSuficiente =
                      cantidadNumerica > 0 &&
                      item.stockDisponible >=
                        cantidadNumerica;

                    const proveedorActivo =
                      item.proveedor.estado.toLowerCase() ===
                      'activo';

                    const esElegible =
                      stockSuficiente &&
                      proveedorActivo;

                    const esMejorPrecio =
                      esElegible &&
                      item.precioPactado ===
                        precioMinimo;

                    const diferencia =
                      item.precioPactado -
                      precioMinimo;

                    const horasItem =
                      extraerHorasMinimas(
                        item.tiempoEntregaEstimado
                      );

                    const esMasRapido =
                      esElegible &&
                      horasItem ===
                        menorTiempoHoras &&
                      menorTiempoHoras < 999;

                    // El descuento solo aplica con stock suficiente
                    const descuentoAplicable =
                      stockSuficiente
                        ? item.proveedor
                            .descuentoVolumen
                        : 0;

                    const precioConDescuento =
                      item.precioPactado *
                      (
                        1 -
                        descuentoAplicable / 100
                      );

                    return (
                      <tr
                        key={
                          item.proveedor.idProveedor
                        }
                      >

                        <td>

                          <div className="producto-info-cell">

                            <span className="producto-nombre">
                              {
                                item.proveedor
                                  .razonSocial
                              }
                            </span>

                            <span className="producto-desc">
                              RUC / NIT:{' '}
                              {
                                item.proveedor
                                  .nitRuc
                              }
                            </span>

                          </div>

                        </td>

                        <td>

                          <span
                            className={`badge-estado badge-${item.proveedor.estado.toLowerCase()}`}
                          >
                            {
                              item.proveedor
                                .estado
                            }
                          </span>

                        </td>

                        {criterios.precio && (
                          <>

                            <td>

                              <span className="precio-pactado-tag">

                                {item.precioPactado.toFixed(
                                  2
                                )}{' '}
                                Bs.

                              </span>

                              <span className="unidad-sub">
                                {' '}
                                /{' '}
                                {
                                  item.unidadMedida
                                }
                              </span>

                              {cantidadNumerica > 0 &&
                                stockSuficiente &&
                                descuentoAplicable > 0 && (

                                  <div
                                    style={{
                                      marginTop: '4px',
                                      fontSize: '0.75rem',
                                      color:
                                        'var(--text-secondary)'
                                    }}
                                  >
                                    Con descuento:{' '}
                                    <strong
                                      style={{
                                        color:
                                          'var(--text-primary)'
                                      }}
                                    >
                                      {precioConDescuento.toFixed(
                                        2
                                      )}{' '}
                                      Bs.
                                    </strong>
                                  </div>

                                )}

                            </td>

                            <td>

                              {esMejorPrecio ? (

                                <span className="badge-estado badge-activo">
                                  Mejor Precio
                                </span>

                              ) : cantidadNumerica > 0 &&
                                esElegible &&
                                precioMinimo > 0 ? (

                                <span
                                  style={{
                                    color: '#dc2626',
                                    fontWeight: 600,
                                    fontSize: '0.8125rem'
                                  }}
                                >
                                  +
                                  {diferencia.toFixed(
                                    2
                                  )}{' '}
                                  Bs.
                                </span>

                              ) : (

                                <span
                                  style={{
                                    color:
                                      'var(--text-secondary)',
                                    fontSize: '0.8125rem'
                                  }}
                                >
                                  No disponible
                                </span>

                              )}

                            </td>

                          </>
                        )}

                        {criterios.descuento && (
                          <td>

                            {cantidadNumerica > 0 &&
                            stockSuficiente &&
                            descuentoAplicable > 0 ? (

                              <span className="descuento-volumen-tag">
                                {descuentoAplicable}%
                              </span>

                            ) : (

                              <span
                                style={{
                                  color:
                                    'var(--text-secondary)',
                                  fontSize: '0.75rem'
                                }}
                              >
                                {cantidadNumerica > 0 &&
                                !stockSuficiente
                                  ? 'No disponible'
                                  : 'Sin descuento'}
                              </span>

                            )}

                          </td>
                        )}

                        {criterios.entrega && (
                          <td>

                            <div
                              className="entrega-cell"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >

                              <Truck
                                size={14}
                                className="icon-truck"
                              />

                              <span
                                style={{
                                  fontWeight: 600
                                }}
                              >
                                {
                                  item.tiempoEntregaEstimado
                                }
                              </span>

                              {esMasRapido && (

                                <span
                                  className="badge-estado badge-activo"
                                  style={{
                                    fontSize: '0.75rem',
                                    padding: '2px 6px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '2px'
                                  }}
                                >
                                  <Zap size={10} />
                                  Entrega Más Rápida
                                </span>

                              )}

                            </div>

                          </td>
                        )}

                        {criterios.stock && (
                          <td>

                            <span className="stock-val">

                              {item.stockDisponible}{' '}
                              {
                                item.unidadMedida
                              }

                              {cantidadNumerica > 0 &&
                                item.stockDisponible <
                                  cantidadNumerica && (

                                  <span
                                    style={{
                                      display: 'block',
                                      color: '#dc2626',
                                      fontSize: '0.75rem',
                                      marginTop: '3px'
                                    }}
                                  >
                                    Stock insuficiente
                                  </span>

                                )}

                              {cantidadNumerica > 0 &&
                                item.stockDisponible >=
                                  cantidadNumerica && (

                                  <span
                                    style={{
                                      display: 'block',
                                      color: '#16a34a',
                                      fontSize: '0.75rem',
                                      marginTop: '3px'
                                    }}
                                  >
                                    Stock disponible
                                  </span>

                                )}

                            </span>

                          </td>
                        )}

                        <td>

                          <span className="font-semibold">
                            {
                              item.proveedor
                                .puntajeDesempeno
                            }%
                          </span>

                        </td>

                      </tr>
                    );
                  }
                )

              ) : (

                <tr>

                  <td
                    colSpan={columnasTabla}
                    className="tabla-vacia"
                  >
                    No se encontraron proveedores
                    registrados para el producto
                    seleccionado.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};