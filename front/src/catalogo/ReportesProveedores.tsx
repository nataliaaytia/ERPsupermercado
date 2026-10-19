import { useState } from "react";
import { Sliders, BarChart3, Truck } from "lucide-react";
import AlertasDocumentos from "./AlertasDocumentos";
import type { Proveedor } from "./tipos";
import {
  obtenerDescuentoMaximo,
  obtenerPrecioPromedioProveedor,
  obtenerMetricasCalidadEntrega,
} from "./funcionesAuxiliares";
const indicadores = [
  {
    id: "precios",
    titulo: "Precios promedio",
    descripcion: "Promedio de precios pactados por proveedor",
    valor: obtenerPrecioPromedioProveedor,
    formato: (valor: number) => `${valor.toFixed(2)} Bs.`,
    porcentaje: false,
  },
  {
    id: "descuentos",
    titulo: "Descuentos por cantidad",
    descripcion: "Descuento máximo por volumen",
    valor: obtenerDescuentoMaximo,
    formato: (valor: number) => `${valor}%`,
    porcentaje: true,
  },
  {
    id: "tiempos",
    titulo: "Tiempos de entrega",
    descripcion: "Días estimados para recibir un pedido",
    valor: (proveedor: Proveedor) => proveedor.tiempoPromedioDias,
    formato: (valor: number) => `${valor} días`,
    porcentaje: false,
  },
  {
    id: "aceptados",
    titulo: "Productos aceptados",
    descripcion: "Productos sin observaciones · datos de demostración",
    valor: (proveedor: Proveedor) =>
      obtenerMetricasCalidadEntrega(proveedor.idProveedor).porcentajeAceptados,
    formato: (valor: number) => `${valor}%`,
    porcentaje: true,
  },
  {
    id: "completas",
    titulo: "Entregas completas",
    descripcion: "Entregas completas · datos de demostración",
    valor: (proveedor: Proveedor) =>
      obtenerMetricasCalidadEntrega(proveedor.idProveedor)
        .porcentajeEntregasCompletas,
    formato: (valor: number) => `${valor}%`,
    porcentaje: true,
  },
];
export default function ReportesProveedores({
  proveedores,
}: {
  proveedores: Proveedor[];
}) {
  const [activos, setActivos] = useState(() =>
    indicadores.map((indicador) => indicador.id),
  );
  const alternar = (id: string) =>
    setActivos((actuales) =>
      actuales.includes(id)
        ? actuales.filter((actual) => actual !== id)
        : [...actuales, id],
    );
  return (
    <div className="dashboard-container">
      <AlertasDocumentos proveedores={proveedores} />
      <div className="dashboard-filtros-bar">
        <span className="filtros-bar-label">
          <Sliders size={15} />
          Indicadores
        </span>
        <div className="filtros-checkboxes-group">
          {indicadores.map((indicador) => (
            <button
              type="button"
              key={indicador.id}
              aria-pressed={activos.includes(indicador.id)}
              className={`checkbox-indicador-btn ${activos.includes(indicador.id) ? "active" : ""}`}
              onClick={() => alternar(indicador.id)}
            >
              {indicador.titulo}
            </button>
          ))}
        </div>
      </div>
      {activos.length === 0 && (
        <p className="tabla-vacia">
          Selecciona un indicador para mostrar su gráfica.
        </p>
      )}
      <div className="dashboard-grid-personalizado">
        {indicadores
          .filter((indicador) => activos.includes(indicador.id))
          .map((indicador) => {
            const maximo = indicador.porcentaje
              ? 100
              : Math.max(1, ...proveedores.map(indicador.valor));
            return (
              <section className="chart-card" key={indicador.id}>
                <div className="chart-header">
                  <div>
                    <h3 className="chart-title">{indicador.titulo}</h3>
                    <p className="chart-subtitle">{indicador.descripcion}</p>
                  </div>
                </div>
                <div className="ranking-bars-list">
                  {proveedores.map((proveedor) => (
                    <div className="ranking-item" key={proveedor.idProveedor}>
                      <div className="ranking-item-info">
                        <span className="ranking-name">
                          {proveedor.razonSocial}
                        </span>
                        <span className="ranking-score">
                          {proveedor.ordenesCompra === 0 &&
                          ["tiempos", "aceptados", "completas"].includes(
                            indicador.id,
                          )
                            ? "Sin historial"
                            : indicador.formato(indicador.valor(proveedor))}
                        </span>
                      </div>
                      <progress
                        className="catalogo-progress"
                        max={maximo}
                        value={indicador.valor(proveedor)}
                        aria-label={`${indicador.titulo}: ${proveedor.razonSocial}`}
                      />
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
      </div>
      <div className="tabla-catalogo-card">
        <div className="tabla-header-info">
          <div className="titulo-tabla-group">
            <BarChart3 size={18} className="icono-seccion" />
            <h3 className="titulo-tabla">Resumen Comparativo de Desempeño</h3>
          </div>
          <span className="conteo-resultados">
            Análisis conjunto de precios, descuentos, tiempos y calidad
          </span>
        </div>

        <div className="documentos-tabla-wrapper">
          <table className="documentos-tabla">
            <thead>
              <tr>
                <th>Proveedor</th>
                <th>Precio Promedio</th>
                <th>Descuento por Volumen</th>
                <th>Tiempo Entrega</th>
                <th>Aceptación Calidad</th>
                <th>Puntaje Desempeño</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map((p) => {
                const precioProm = obtenerPrecioPromedioProveedor(p);
                const calidadPct = obtenerMetricasCalidadEntrega(
                  p.idProveedor,
                ).porcentajeAceptados;
                return (
                  <tr key={p.idProveedor}>
                    <td>
                      <div className="producto-info-cell">
                        <span className="producto-nombre">{p.razonSocial}</span>
                        <span className="producto-desc">RUC: {p.nitRuc}</span>
                      </div>
                    </td>
                    <td>
                      <span className="precio-pactado-tag">
                        {precioProm > 0
                          ? `${precioProm.toFixed(2)} Bs.`
                          : "N/A"}
                      </span>
                    </td>
                    <td>
                      <span className="font-semibold">
                        {obtenerDescuentoMaximo(p)}%
                      </span>
                    </td>
                    <td>
                      <div className="entrega-cell">
                        <Truck size={14} className="icon-truck" />
                        <span>
                          {p.ordenesCompra > 0
                            ? `${p.tiempoPromedioDias} días`
                            : "Sin historial"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="score-calidad">
                        {p.ordenesCompra > 0
                          ? `${calidadPct}%`
                          : "Sin historial"}
                      </span>
                    </td>
                    <td>
                      <span className="font-semibold">
                        {p.ordenesCompra > 0
                          ? `${p.puntajeDesempeno}%`
                          : "Sin historial"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge-estado badge-${p.estado.toLowerCase()}`}
                      >
                        {p.estado}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
