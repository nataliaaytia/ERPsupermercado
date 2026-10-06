import { useState } from "react";
import { TrendingUp, ShoppingBag, Award, BarChart3 } from "lucide-react";
import type { Proveedor } from "./tipos";
import { obtenerDescuentoMaximo } from "./funcionesAuxiliares";
import { datosFrecuenciaMensual } from "./datosProveedores";
export default function RankingProveedores({
  proveedores,
}: {
  proveedores: Proveedor[];
}) {
  const [criterioRanking, setCriterioRanking] = useState<
    "descuento" | "puntuacion" | "tiempo"
  >("descuento");
  const obtenerValor = (proveedor: Proveedor) =>
    criterioRanking === "descuento"
      ? obtenerDescuentoMaximo(proveedor)
      : criterioRanking === "puntuacion"
        ? proveedor.puntajeDesempeno
        : proveedor.tiempoPromedioDias;
  const proveedoresEvaluados = proveedores.filter(
    (proveedor) => proveedor.ordenesCompra > 0,
  );
  const proveedoresOrdenadosRanking = [...proveedoresEvaluados].sort((a, b) =>
    criterioRanking === "tiempo"
      ? obtenerValor(a) - obtenerValor(b)
      : obtenerValor(b) - obtenerValor(a),
  );
  const top3Proveedores = proveedoresOrdenadosRanking.slice(0, 3);
  const maxValor =
    criterioRanking === "tiempo"
      ? Math.max(1, ...proveedores.map(obtenerValor))
      : 100;
  const totalOrdenes = proveedores.reduce(
    (total, proveedor) => total + proveedor.ordenesCompra,
    0,
  );
  const promedioDesempeno = proveedoresEvaluados.length
    ? Math.round(
        proveedoresEvaluados.reduce(
          (total, proveedor) => total + proveedor.puntajeDesempeno,
          0,
        ) / proveedoresEvaluados.length,
      )
    : 0;
  const maxOrdenes = Math.max(
    1,
    ...datosFrecuenciaMensual.map((item) => item.ordenes),
  );
  return (
    <div className="dashboard-container">
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-blue">
            <TrendingUp size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-title">Promedio Desempeño</span>
            <span className="kpi-value">{promedioDesempeno}%</span>
            <span className="kpi-sub positive">Datos de demostración</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-purple">
            <ShoppingBag size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-title">Órdenes Totales</span>
            <span className="kpi-value">{totalOrdenes}</span>
            <span className="kpi-sub">Frecuencia de compra activa</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-green">
            <Award size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-title">Proveedor Líder</span>
            <span className="kpi-value">
              {top3Proveedores[0]?.razonSocial ?? "Sin datos"}
            </span>
            <span className="kpi-sub">Según el criterio seleccionado</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-amber">
            <BarChart3 size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-title">Proveedores Activos</span>
            <span className="kpi-value">
              {proveedores.filter((p) => p.estado === "Activo").length} /{" "}
              {proveedores.length}
            </span>
            <span className="kpi-sub">Condición operativa</span>
          </div>
        </div>
      </div>

      <div className="ranking-header-control">
        <div>
          <h3 className="chart-title">
            Ranking de Proveedores por Descuentos y Desempeño
          </h3>
          <p className="chart-subtitle">
            Selecciona el criterio para filtrar los proveedores y actualizar la
            gráfica dinámicamente
          </p>
        </div>

        <div className="ranking-select-container">
          <span className="ranking-select-label">Ordenar por:</span>
          <select
            className="ranking-combobox"
            value={criterioRanking}
            onChange={(e) =>
              setCriterioRanking(
                e.target.value as "descuento" | "puntuacion" | "tiempo",
              )
            }
          >
            <option value="descuento">Los que más descuentos ofrecen</option>
            <option value="puntuacion">Los que más puntuación tienen</option>
            <option value="tiempo">Los que menos tardan en entregar</option>
          </select>
        </div>
      </div>

      <div className="ranking-top3-grid">
        {top3Proveedores.map((p, idx) => (
          <div
            key={p.idProveedor}
            className={`ranking-top-card pos-${idx + 1}`}
          >
            <span className="top-badge-pos">Puesto {idx + 1}</span>
            <h4 className="top-card-nombre">{p.razonSocial}</h4>
            <span className="top-card-sub">RUC: {p.nitRuc}</span>

            <div className="top-card-metric">
              <span className="metric-valor-destacado">
                {criterioRanking === "descuento" &&
                  `${obtenerDescuentoMaximo(p)}%`}
                {criterioRanking === "puntuacion" && `${p.puntajeDesempeno}%`}
                {criterioRanking === "tiempo" && `${p.tiempoPromedioDias} días`}
              </span>
              <span className="metric-etiqueta">
                {criterioRanking === "descuento" && "Descuento por Cantidad"}
                {criterioRanking === "puntuacion" && "Puntaje de Desempeño"}
                {criterioRanking === "tiempo" && "Tiempo Promedio de Entrega"}
              </span>
            </div>

            <div>
              <span className={`badge-estado badge-${p.estado.toLowerCase()}`}>
                {p.estado}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Gráfica Comparativa de Ranking</h3>
              <p className="chart-subtitle">
                {criterioRanking === "descuento" &&
                  "Porcentaje de descuento ofrecido para compras por volumen"}
                {criterioRanking === "puntuacion" &&
                  "Evaluación global de desempeño y cumplimiento"}
                {criterioRanking === "tiempo" &&
                  "Días promedios de tiempo de respuesta y abastecimiento"}
              </p>
            </div>
            <BarChart3 size={18} className="chart-header-icon" />
          </div>

          <div className="ranking-bars-list">
            {proveedoresOrdenadosRanking.map((p) => {
              const valor = obtenerValor(p);
              const textoValor = `${valor}${criterioRanking === "tiempo" ? " días" : "%"}`;
              return (
                <div key={p.idProveedor} className="ranking-item">
                  <div className="ranking-item-info">
                    <span className="ranking-name">{p.razonSocial}</span>
                    <span className="ranking-score">{textoValor}</span>
                  </div>
                  <div className="ranking-bar-track">
                    <progress
                      className="catalogo-progress"
                      value={valor}
                      max={maxValor}
                      aria-label={`${p.razonSocial}: ${textoValor}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Frecuencia Mensual de Órdenes</h3>
              <p className="chart-subtitle">
                Volumen de solicitudes procesadas en los últimos meses
              </p>
            </div>
            <ShoppingBag size={18} className="chart-header-icon" />
          </div>

          <div className="freq-bar-chart">
            {datosFrecuenciaMensual.map((item) => {
              return (
                <div key={item.mes} className="freq-bar-col">
                  <span className="freq-bar-val">{item.ordenes}</span>
                  <div className="freq-bar-container">
                    <progress
                      className="catalogo-progress catalogo-progress--vertical"
                      max={maxOrdenes}
                      value={item.ordenes}
                      aria-label={`${item.mes}: ${item.ordenes} órdenes`}
                    />
                  </div>
                  <span className="freq-bar-label">{item.mes}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
