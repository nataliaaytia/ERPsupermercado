import { useState } from "react";
import {
  Search,
  RefreshCw,
  Power,
  AlertCircle,
  Clock,
  Plus,
  FileText,
  Paperclip,
  CheckCircle2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import type {
  Proveedor,
  EstadoProveedor,
  Documento,
  DatosProveedor,
} from "./tipos";
import { obtenerMetricasCalidadEntrega, fechaLocal } from "./funcionesAuxiliares";
import ProveedorModal from "./ProveedorModal";
import { validarProveedor, normalizarProveedor } from "./validacionProveedor";
import DocumentoModal from "./DocumentoModal";
interface Props {
  onRegistrarProveedor: (datos: DatosProveedor) => string | null;
  proveedores: Proveedor[];
  proveedorSeleccionado: Proveedor;
  onSeleccionar: (id: number) => void;
  cambiarEstadoProveedor: (estado: EstadoProveedor) => void;
  onRegistrarDocumento: (documento: Documento) => void;
}
export default function GestionProveedores({
  proveedores,
  onRegistrarProveedor,
  proveedorSeleccionado,
  onSeleccionar,
  cambiarEstadoProveedor,
  onRegistrarDocumento,
}: Props) {
  const [filtroBusquedaProv, setFiltroBusquedaProv] = useState<string>("");
  const [filtroEstadoProv, setFiltroEstadoProv] = useState<string>("Todos");
  const [resultadoValidacion, setResultadoValidacion] = useState<{
    ejecutado: boolean;
    esValido: boolean;
    detalles: {
      campo: string;
      valido: boolean;
      mensaje: string;
    }[];
  } | null>(null);
  const [modalProveedorAbierto, setModalProveedorAbierto] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [modalDocAbierto, setModalDocAbierto] = useState(false);
  const ejecutarValidacion = () => {
    const p = proveedorSeleccionado;
    const errores = validarProveedor(normalizarProveedor(p));
    const campos = [
      ["nitRuc", "RUC / NIT"],
      ["razonSocial", "Razón social"],
      ["direccion", "Dirección fiscal"],
      ["telefono", "Teléfono"],
      ["correo", "Correo electrónico"],
    ] as const;
    const documentosValidos =
      p.documentos.length > 0 &&
      p.documentos.every(
        (documento) =>
          documento.estadoValidacion === "Válido" &&
          documento.fechaVencimiento >= fechaLocal(),
      );
    const detalles = [
      ...campos.map(([clave, campo]) => ({
        campo,
        valido: !errores[clave],
        mensaje: errores[clave] ?? "Registrado correctamente",
      })),
      {
        campo: "Documentación adjunta",
        valido: documentosValidos,
        mensaje: documentosValidos
          ? "Todos los documentos vigentes"
          : p.documentos.length
            ? "Existen documentos vencidos o pendientes de validación"
            : "Sin documentos adjuntos",
      },
    ];
    const esValido = detalles.every((item) => item.valido);
    setResultadoValidacion({ ejecutado: true, esValido, detalles });
  };
  const proveedoresFiltrados = proveedores.filter((p) => {
    const coincideTexto =
      p.razonSocial.toLowerCase().includes(filtroBusquedaProv.toLowerCase()) ||
      p.nitRuc.includes(filtroBusquedaProv);
    const coincideEstado =
      filtroEstadoProv === "Todos" || p.estado === filtroEstadoProv;
    return coincideTexto && coincideEstado;
  });
  return (
    <>
      <div className="proveedores-toolbar">
        <p>{proveedores.length} proveedores registrados</p>
        <button
          type="button"
          className="btn-guardar"
          onClick={() => {
            setMensajeExito("");
            setModalProveedorAbierto(true);
          }}
        >
          <Plus size={16} /> Registrar proveedor
        </button>
      </div>
      {mensajeExito && (
        <div className="proveedor-registrado" role="status">
          <CheckCircle2 size={18} />
          {mensajeExito}
        </div>
      )}
      {modalProveedorAbierto && (
        <ProveedorModal
          nitsExistentes={proveedores.map((proveedor) => proveedor.nitRuc)}
          onCerrar={() => setModalProveedorAbierto(false)}
          onGuardar={(datos) => {
            const error = onRegistrarProveedor(datos);
            if (error) return error;
            setFiltroBusquedaProv("");
            setFiltroEstadoProv("Todos");
            setResultadoValidacion(null);
            setModalProveedorAbierto(false);
            setMensajeExito(
              `Proveedor ${datos.razonSocial} registrado correctamente.`,
            );
            return null;
          }}
        />
      )}
      <div className="validacion-grid">
        <div className="lista-proveedores-card">
          <div className="busqueda-box">
            <Search size={16} className="busqueda-icon" />
            <input
              type="text"
              placeholder="Buscar por RUC o Razón Social..."
              value={filtroBusquedaProv}
              onChange={(e) => setFiltroBusquedaProv(e.target.value)}
              className="busqueda-input"
            />
          </div>

          <div className="filtro-estado-bar">
            {["Todos", "Activo", "Inactivo", "Observado", "Pendiente"].map(
              (est) => (
                <button
                  key={est}
                  className={`btn-filtro-estado ${filtroEstadoProv === est ? "active" : ""}`}
                  onClick={() => setFiltroEstadoProv(est)}
                >
                  {est}
                </button>
              ),
            )}
          </div>

          <div className="proveedores-lista">
            {proveedoresFiltrados.length === 0 && (
              <p className="tabla-vacia">No se encontraron proveedores.</p>
            )}
            {proveedoresFiltrados.map((p) => (
              <button
                type="button"
                key={p.idProveedor}
                className={`proveedor-item ${proveedorSeleccionado.idProveedor === p.idProveedor ? "active" : ""}`}
                onClick={() => {
                  onSeleccionar(p.idProveedor);
                  setMensajeExito("");
                  setResultadoValidacion(null);
                }}
              >
                <div className="item-main">
                  <span className="item-title">{p.razonSocial}</span>
                  <span className="item-sub">RUC: {p.nitRuc}</span>
                </div>
                <span
                  className={`badge-estado badge-${p.estado.toLowerCase()}`}
                >
                  {p.estado}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="detalle-validacion-card">
          <div className="detalle-header">
            <div>
              <h2 className="detalle-title">
                {proveedorSeleccionado.razonSocial}
              </h2>
              <span className="detalle-sub">
                RUC / NIT: {proveedorSeleccionado.nitRuc}
              </span>
            </div>
            <div className="acciones-header">
              <button className="btn-validar" onClick={ejecutarValidacion}>
                <RefreshCw size={14} />
                <span>Validar Información</span>
              </button>
            </div>
          </div>

          <div className="seccion-datos">
            <div className="seccion-header-inline">
              <h3 className="seccion-titulo">Estado del Proveedor</h3>
              <span
                className={`badge-estado badge-${proveedorSeleccionado.estado.toLowerCase()}`}
              >
                {proveedorSeleccionado.estado}
              </span>
            </div>

            <div className="control-estado-panel">
              <span className="control-estado-label">
                Cambiar Estado Operativo:
              </span>
              <div className="botones-estado-group">
                <button
                  className={`btn-cambio-estado btn-activo ${proveedorSeleccionado.estado === "Activo" ? "selected" : ""}`}
                  onClick={() => cambiarEstadoProveedor("Activo")}
                >
                  <Power size={13} />
                  <span>Activo</span>
                </button>
                <button
                  className={`btn-cambio-estado btn-inactivo ${proveedorSeleccionado.estado === "Inactivo" ? "selected" : ""}`}
                  onClick={() => cambiarEstadoProveedor("Inactivo")}
                >
                  <Power size={13} />
                  <span>Inactivo</span>
                </button>
                <button
                  className={`btn-cambio-estado btn-observado ${proveedorSeleccionado.estado === "Observado" ? "selected" : ""}`}
                  onClick={() => cambiarEstadoProveedor("Observado")}
                >
                  <AlertCircle size={13} />
                  <span>Observado</span>
                </button>
                <button
                  className={`btn-cambio-estado btn-pendiente ${proveedorSeleccionado.estado === "Pendiente" ? "selected" : ""}`}
                  onClick={() => cambiarEstadoProveedor("Pendiente")}
                >
                  <Clock size={13} />
                  <span>Pendiente</span>
                </button>
              </div>
            </div>
          </div>

          <div className="seccion-datos">
            <h3 className="seccion-titulo">Información General</h3>
            <div className="datos-grid">
              <div className="dato-field">
                <span className="field-label">Dirección Fiscal</span>
                <span className="field-value">
                  {proveedorSeleccionado.direccion}
                </span>
              </div>
              <div className="dato-field">
                <span className="field-label">Teléfono</span>
                <span className="field-value">
                  {proveedorSeleccionado.telefono}
                </span>
              </div>
              <div className="dato-field">
                <span className="field-label">Correo Electrónico</span>
                <span className="field-value">
                  {proveedorSeleccionado.correo}
                </span>
              </div>
              <div className="dato-field desempeno-field">
                <div className="desempeno-header">
                  <span className="field-label">Desempeño del proveedor</span>
                  <span className="desempeno-porcentaje">
                    {proveedorSeleccionado.ordenesCompra > 0
                      ? `${proveedorSeleccionado.puntajeDesempeno}%`
                      : "Sin historial"}
                  </span>
                </div>

                <div className="desempeno-barra">
                  <progress
                    className="catalogo-progress"
                    max={100}
                    value={proveedorSeleccionado.puntajeDesempeno}
                    aria-label="Desempeño del proveedor"
                  />
                </div>

                <span className="desempeno-nivel">
                  {proveedorSeleccionado.ordenesCompra === 0
                    ? "Todavía no hay evaluaciones de este proveedor"
                    : proveedorSeleccionado.puntajeDesempeno >= 90
                      ? "Excelente nivel de cumplimiento"
                      : proveedorSeleccionado.puntajeDesempeno >= 75
                        ? "Buen nivel de cumplimiento"
                        : "Nivel de cumplimiento por mejorar"}
                </span>
              </div>
              <div className="dato-field">
                <span className="field-label">Productos Aceptados</span>
                <span className="field-value">
                  {proveedorSeleccionado.ordenesCompra > 0
                    ? `${obtenerMetricasCalidadEntrega(proveedorSeleccionado.idProveedor).porcentajeAceptados}%`
                    : "Sin historial"}
                </span>
              </div>
              <div className="dato-field">
                <span className="field-label">Entregas Completas</span>
                <span className="field-value">
                  {proveedorSeleccionado.ordenesCompra > 0
                    ? `${obtenerMetricasCalidadEntrega(proveedorSeleccionado.idProveedor).porcentajeEntregasCompletas}%`
                    : "Sin historial"}
                </span>
              </div>
            </div>
          </div>

          <div className="seccion-datos">
            <div className="seccion-header-flex">
              <h3 className="seccion-titulo">Documentos del Proveedor</h3>
              <button
                className="btn-registrar-doc"
                onClick={() => {
                  setModalDocAbierto(true);
                }}
              >
                <Plus size={14} />
                <span>Registrar Documento</span>
              </button>
            </div>

            <div className="documentos-tabla-wrapper">
              <table className="documentos-tabla">
                <thead>
                  <tr>
                    <th>Tipo Documento</th>
                    <th>Numero</th>
                    <th>Vencimiento</th>
                    <th>Archivo Adjunto</th>
                    <th>Estado Documento </th>
                  </tr>
                </thead>
                <tbody>
                  {proveedorSeleccionado.documentos.length > 0 ? (
                    proveedorSeleccionado.documentos.map((doc) => (
                      <tr key={doc.idDocumento}>
                        <td>
                          <div className="doc-type-cell">
                            <FileText size={14} />
                            <span>{doc.tipoDocumento}</span>
                          </div>
                        </td>
                        <td>{doc.numeroDocumento}</td>
                        <td>{doc.fechaVencimiento}</td>
                        <td>
                          <div className="doc-file-cell">
                            <Paperclip size={12} />
                            <span>{doc.archivo}</span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`doc-status status-${(doc.fechaVencimiento < fechaLocal() ? "Vencido" : doc.estadoValidacion).toLowerCase()}`}
                          >
                            {doc.fechaVencimiento < fechaLocal()
                              ? "Vencido"
                              : doc.estadoValidacion}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="tabla-vacia">
                        No hay documentos registrados para este proveedor.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {resultadoValidacion && (
            <div
              className={`resultado-panel ${resultadoValidacion.esValido ? "panel-exito" : "panel-alerta"}`}
            >
              <div className="resultado-header">
                {resultadoValidacion.esValido ? (
                  <CheckCircle2 size={18} className="icon-exito" />
                ) : (
                  <AlertCircle size={18} className="icon-alerta" />
                )}
                <span className="resultado-titulo">
                  {resultadoValidacion.esValido
                    ? "Validación Exitosa: La información cumple los requisitos obligatorios"
                    : "Validación Incompleta: Se detectaron inconsistencias u omisiones"}
                </span>
              </div>

              <div className="checklist-grid">
                {resultadoValidacion.detalles.map((det, index) => (
                  <div key={index} className="check-item">
                    {det.valido ? (
                      <ShieldCheck size={14} className="check-valid" />
                    ) : (
                      <XCircle size={14} className="check-invalid" />
                    )}
                    <span className="check-label">{det.campo}:</span>
                    <span className="check-msg">{det.mensaje}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {modalDocAbierto && (
        <DocumentoModal
          onCerrar={() => setModalDocAbierto(false)}
          onGuardar={(documento) => {
            onRegistrarDocumento(documento);
            setResultadoValidacion(null);
            setModalDocAbierto(false);
          }}
        />
      )}
    </>
  );
}
