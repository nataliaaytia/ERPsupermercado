import React, { useState } from 'react';
import { LineSidebar } from './LineSidebar';
import {
  ShieldCheck, CheckCircle2, XCircle, AlertCircle, FileText,
  Search, RefreshCw, Power, Clock, BarChart3, TrendingUp,
  Award, ShoppingBag, Calendar, ArrowUpRight, Package, Truck,
  Tag, Filter, Building2, Plus, Upload, X, Paperclip
} from 'lucide-react';
import './Catalogo.css';


export type EstadoProveedor = 'Activo' | 'Inactivo' | 'Pendiente' | 'Observado';

export interface Documento {
  idDocumento: number;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaVencimiento: string;
  archivo: string;
  estadoValidacion: 'Válido' | 'Vencido' | 'Pendiente';
}

export interface ProductoCatalogo {
  idProducto: number;
  sku: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  precioPactado: number;
  tiempoEntregaEstimado: string;
  stockDisponible: number;
  unidadMedida: string;
}

export interface Proveedor {
  idProveedor: number;
  nitRuc: string;
  razonSocial: string;
  direccion: string;
  telefono: string;
  correo: string;
  estado: EstadoProveedor;
  puntajeDesempeno: number; // 0 - 100
  ordenesCompra: number;
  montoTotalComprado: number;
  documentos: Documento[];
  catalogoProductos: ProductoCatalogo[];
}

//hijas cambien esto por la conexion la back garcias

const proveedoresIniciales: Proveedor[] = [
  {
    idProveedor: 1,
    nitRuc: '20601234567',
    razonSocial: 'Pedrauser',
    direccion: 'Av. Landaeta, Sepa dios donde vive',
    telefono: '+591 77756186',
    correo: 'pedrauser@sonic.com',
    estado: 'Activo',
    puntajeDesempeno: 95,
    ordenesCompra: 48,
    montoTotalComprado: 125000,
    documentos: [
      {
        //nosequevaaqui
        idDocumento: 101,
        tipoDocumento: 'Ficha RUC',
        numeroDocumento: '20601234567',
        fechaVencimiento: '2027-12-31',
        archivo: 'ficha_ruc_2026.pdf',
        estadoValidacion: 'Válido'
      },
      {
        idDocumento: 102,
        tipoDocumento: 'Certificado de Homologación',
        numeroDocumento: 'CH-2025-089',
        fechaVencimiento: '2026-11-15',
        archivo: 'homologacion_cert.pdf',
        estadoValidacion: 'Válido'
      }
    ],
    catalogoProductos: [
      {
        //esto igual lo cambian alv
        idProducto: 1,
        sku: 'PROD-LOG-001',
        nombre: 'Caja de Cartón Corrugado Doble Canal (50x40x40)',
        categoria: 'Empaque y Embalaje',
        descripcion: 'Caja de alta resistencia para transporte pesado e importaciones.',
        precioPactado: 4.50,
        tiempoEntregaEstimado: '24 a 48 horas',
        stockDisponible: 5000,
        unidadMedida: 'Unidad'
      },
      {
        idProducto: 2,
        sku: 'PROD-LOG-002',
        nombre: 'Cinta Embalaje Transparente (Pack x 6)',
        categoria: 'Empaque y Embalaje',
        descripcion: 'Adhesivo de acrílico de alta fijación industrial.',
        precioPactado: 18.20,
        tiempoEntregaEstimado: '24 horas',
        stockDisponible: 1200,
        unidadMedida: 'Pack'
      },
      {
        idProducto: 3,
        sku: 'PROD-LOG-003',
        nombre: 'Film Stretch Strechable Industrial 20 micras',
        categoria: 'Paletizado',
        descripcion: 'Rollo de plástico film transparente para asegurar parihuelas.',
        precioPactado: 32.00,
        tiempoEntregaEstimado: '2 a 3 días hábiles',
        stockDisponible: 850,
        unidadMedida: 'Rollo'
      }
    ]
  },
  {
    idProveedor: 2,
    nitRuc: '20109876543',
    razonSocial: 'Ya no se qeu poner wazaaa',
    direccion: 'Calle Comercio, casco viejo creo',
    telefono: '+591 23462742',
    correo: 'cambien@losdatos.com',
    estado: 'Observado',
    puntajeDesempeno: 72,
    ordenesCompra: 24,
    montoTotalComprado: 58000,
    documentos: [
      {
        idDocumento: 103,
        tipoDocumento: 'Ficha RUC',
        numeroDocumento: '20109876543',
        fechaVencimiento: '2026-05-10',
        archivo: 'ficha_ruc_dist.pdf',
        estadoValidacion: 'Vencido'
      }
    ],
    catalogoProductos: [
      {
        idProducto: 4,
        sku: 'PROD-NOR-101',
        nombre: 'Aceite Lubricante Multipropósito 1L',
        categoria: 'Mantenimiento',
        descripcion: 'Formulación para engranajes y maquinaria industrial pesada.',
        precioPactado: 28.50,
        tiempoEntregaEstimado: '3 a 5 días hábiles',
        stockDisponible: 340,
        unidadMedida: 'Litro'
      },
      {
        idProducto: 5,
        sku: 'PROD-NOR-102',
        nombre: 'Guantes de Nitrilo Industrial Reforzado (Caja x 100)',
        categoria: 'EPP y Seguridad',
        descripcion: 'Protección para manejo de químicos y grasas.',
        precioPactado: 45.00,
        tiempoEntregaEstimado: '2 a 4 días hábiles',
        stockDisponible: 600,
        unidadMedida: 'Caja'
      }
    ]
  },
  {
    idProveedor: 3,
    nitRuc: '20554433221',
    razonSocial: 'Nilmar ponte a trabajar',
    direccion: 'Senkata, El alto',
    telefono: '+591 70544491',
    correo: 'natesito@waza.com',
    estado: 'Inactivo',
    puntajeDesempeno: 45,
    ordenesCompra: 8,
    montoTotalComprado: 14200,
    documentos: [],
    catalogoProductos: []
  },
  {
    idProveedor: 4,
    nitRuc: '20448899112',
    razonSocial: 'Campielcampi',
    direccion: 'nosexdd, la paz',
    telefono: '+591 71994068',
    correo: 'samiel@elcmampi.com',
    estado: 'Activo',
    puntajeDesempeno: 88,
    ordenesCompra: 36,
    montoTotalComprado: 94000,
    documentos: [
      {
        idDocumento: 104,
        tipoDocumento: 'Ficha RUC',
        numeroDocumento: '20448899112',
        fechaVencimiento: '2027-08-20',
        archivo: 'ficha_ruc_tecno.pdf',
        estadoValidacion: 'Válido'
      }
    ],
    catalogoProductos: [
      {
        idProducto: 6,
        sku: 'PROD-TEC-501',
        nombre: 'Lector de Código de Barras Láser USB / Bluetooth',
        categoria: 'Hardware Almacén',
        descripcion: 'Escáner industrial con soporte ergonómico y lectura 2D/QR.',
        precioPactado: 185.00,
        tiempoEntregaEstimado: '24 a 48 horas',
        stockDisponible: 120,
        unidadMedida: 'Unidad'
      },
      {
        idProducto: 7,
        sku: 'PROD-TEC-502',
        nombre: 'Impresora Térmica de Etiquetas Adhesivas',
        categoria: 'Hardware Almacén',
        descripcion: 'Resolución 203 DPI, velocidad de impresión 152 mm/s.',
        precioPactado: 640.00,
        tiempoEntregaEstimado: '2 días hábiles',
        stockDisponible: 45,
        unidadMedida: 'Unidad'
      }
    ]
  }
];

//esto igual a futuro vamos a cambiar xd
const datosFrecuenciaMensual = [
  { mes: 'Ene', ordenes: 12, monto: 22000 },
  { mes: 'Feb', ordenes: 18, monto: 34000 },
  { mes: 'Mar', ordenes: 15, monto: 28000 },
  { mes: 'Abr', ordenes: 22, monto: 45000 },
  { mes: 'May', ordenes: 28, monto: 56000 },
  { mes: 'Jun', ordenes: 21, monto: 41000 }
];

const menuItems = [
  'Gestionar Proveedores',
  'Asociar Catálogo',
  'Ver Información',
  'Ver Catálogo',
  'Ranking e Indicadores'
];

export const Catalogo = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [proveedores, setProveedores] = useState<Proveedor[]>(proveedoresIniciales);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor>(proveedoresIniciales[0]);

  const [filtroBusquedaProv, setFiltroBusquedaProv] = useState<string>('');
  const [filtroEstadoProv, setFiltroEstadoProv] = useState<string>('Todos');
  const [resultadoValidacion, setResultadoValidacion] = useState<{
    ejecutado: boolean;
    esValido: boolean;
    detalles: { campo: string; valido: boolean; mensaje: string }[];
  } | null>(null);

  const [modalDocAbierto, setModalDocAbierto] = useState<boolean>(false);
  const [nuevoDoc, setNuevoDoc] = useState({
    tipoDocumento: 'Ficha RUC',
    numeroDocumento: '',
    fechaVencimiento: '',
    archivoNombre: ''
  });
  const [errorFormDoc, setErrorFormDoc] = useState<string>('');

  const [busquedaProducto, setBusquedaProducto] = useState<string>('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('Todas');

  const cambiarEstadoProveedor = (nuevoEstado: EstadoProveedor) => {
    const listaActualizada = proveedores.map(p =>
      p.idProveedor === proveedorSeleccionado.idProveedor ? { ...p, estado: nuevoEstado } : p
    );
    setProveedores(listaActualizada);
    setProveedorSeleccionado({ ...proveedorSeleccionado, estado: nuevoEstado });
  };

  const handleRegistrarDocumento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoDoc.numeroDocumento.trim()) {
      setErrorFormDoc('Debe ingresar el número del documento.');
      return;
    }
    if (!nuevoDoc.fechaVencimiento) {
      setErrorFormDoc('Debe seleccionar la fecha de vencimiento.');
      return;
    }

    const fechaVenc = new Date(nuevoDoc.fechaVencimiento);
    const hoy = new Date();
    const estadoValid: 'Válido' | 'Vencido' = fechaVenc >= hoy ? 'Válido' : 'Vencido';

    const nuevoDocumentoObjeto: Documento = {
      idDocumento: Date.now(),
      tipoDocumento: nuevoDoc.tipoDocumento,
      numeroDocumento: nuevoDoc.numeroDocumento.trim(),
      fechaVencimiento: nuevoDoc.fechaVencimiento,
      archivo: nuevoDoc.archivoNombre || `${nuevoDoc.tipoDocumento.toLowerCase().replace(/\s+/g, '_')}_${nuevoDoc.numeroDocumento}.pdf`,
      estadoValidacion: estadoValid
    };

    const docsActualizados = [...proveedorSeleccionado.documentos, nuevoDocumentoObjeto];
    const provActualizado = { ...proveedorSeleccionado, documentos: docsActualizados };

    const listaProveedoresActualizada = proveedores.map(p =>
      p.idProveedor === proveedorSeleccionado.idProveedor ? provActualizado : p
    );

    setProveedores(listaProveedoresActualizada);
    setProveedorSeleccionado(provActualizado);

    setNuevoDoc({
      tipoDocumento: 'Ficha RUC',
      numeroDocumento: '',
      fechaVencimiento: '',
      archivoNombre: ''
    });
    setErrorFormDoc('');
    setModalDocAbierto(false);
    setResultadoValidacion(null);
  };

  const ejecutarValidacion = () => {
    const p = proveedorSeleccionado;
    const detalles = [
      {
        campo: 'RUC / NIT',
        valido: Boolean(p.nitRuc && p.nitRuc.length >= 10),
        mensaje: p.nitRuc && p.nitRuc.length >= 10 ? 'Formato y longitud correctos' : 'RUC/NIT no válido'
      },
      {
        campo: 'Razón Social',
        valido: Boolean(p.razonSocial && p.razonSocial.trim().length > 3),
        mensaje: p.razonSocial ? 'Registrado correctamente' : 'Razón social incompleta'
      },
      {
        campo: 'Dirección Fiscal',
        valido: Boolean(p.direccion && p.direccion.trim().length > 5),
        mensaje: p.direccion ? 'Dirección verificada' : 'Dirección requerida'
      },
      {
        campo: 'Teléfono de Contacto',
        valido: Boolean(p.telefono && p.telefono.trim().length >= 7),
        mensaje: p.telefono ? 'Teléfono válido' : 'Teléfono no registrado'
      },
      {
        campo: 'Correo Electrónico',
        valido: Boolean(p.correo && p.correo.includes('@')),
        mensaje: p.correo && p.correo.includes('@') ? 'Correo con formato válido' : 'Correo inválido'
      },
      {
        campo: 'Documentación Adjunta',
        valido: p.documentos.length > 0 && p.documentos.every(d => d.estadoValidacion === 'Válido'),
        mensaje: p.documentos.length === 0
          ? 'Sin documentos adjuntos'
          : p.documentos.every(d => d.estadoValidacion === 'Válido')
            ? 'Todos los documentos vigentes'
            : 'Existen documentos vencidos'
      }
    ];

    const esValido = detalles.every(item => item.valido);
    setResultadoValidacion({ ejecutado: true, esValido, detalles });
  };

  const proveedoresFiltrados = proveedores.filter(p => {
    const coincideTexto = p.razonSocial.toLowerCase().includes(filtroBusquedaProv.toLowerCase()) || p.nitRuc.includes(filtroBusquedaProv);
    const coincideEstado = filtroEstadoProv === 'Todos' || p.estado === filtroEstadoProv;
    return coincideTexto && coincideEstado;
  });

  const productosFiltrados = proveedorSeleccionado.catalogoProductos.filter(prod => {
    const coincideTexto =
      prod.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
      prod.sku.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
      prod.descripcion.toLowerCase().includes(busquedaProducto.toLowerCase());

    const coincideCategoria = categoriaFiltro === 'Todas' || prod.categoria === categoriaFiltro;
    return coincideTexto && coincideCategoria;
  });

  const categoriasDisponibles = ['Todas', ...Array.from(
    new Set(proveedorSeleccionado.catalogoProductos.map(p => p.categoria))
  )];

  const totalOrdenes = proveedores.reduce((sum, p) => sum + p.ordenesCompra, 0);
  const promedioDesempeno = Math.round(proveedores.reduce((sum, p) => sum + p.puntajeDesempeno, 0) / proveedores.length);
  const maxOrdenes = Math.max(...datosFrecuenciaMensual.map(d => d.ordenes));

  return (
    <div className="catalogo-container">
      <aside className="catalogo-sidebar">
        <LineSidebar
          items={menuItems}
          defaultActive={activeIndex}
          onItemClick={(index) => {
            setActiveIndex(index);
            setResultadoValidacion(null);
          }}
        />
      </aside>

      <section className="catalogo-content">
        <header className="catalogo-header">
          <h1 className="catalogo-title">{menuItems[activeIndex]}</h1>
          <p className="catalogo-subtitle">Módulo de Proveedores y Toma de Decisiones</p>
        </header>

        {activeIndex === 0 && (
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
                {['Todos', 'Activo', 'Inactivo', 'Observado', 'Pendiente'].map((est) => (
                  <button
                    key={est}
                    className={`btn-filtro-estado ${filtroEstadoProv === est ? 'active' : ''}`}
                    onClick={() => setFiltroEstadoProv(est)}
                  >
                    {est}
                  </button>
                ))}
              </div>

              <div className="proveedores-lista">
                {proveedoresFiltrados.map((p) => (
                  <div
                    key={p.idProveedor}
                    className={`proveedor-item ${proveedorSeleccionado.idProveedor === p.idProveedor ? 'active' : ''}`}
                    onClick={() => {
                      setProveedorSeleccionado(p);
                      setResultadoValidacion(null);
                    }}
                  >
                    <div className="item-main">
                      <span className="item-title">{p.razonSocial}</span>
                      <span className="item-sub">RUC: {p.nitRuc}</span>
                    </div>
                    <span className={`badge-estado badge-${p.estado.toLowerCase()}`}>
                      {p.estado}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="detalle-validacion-card">
              <div className="detalle-header">
                <div>
                  <h2 className="detalle-title">{proveedorSeleccionado.razonSocial}</h2>
                  <span className="detalle-sub">RUC / NIT: {proveedorSeleccionado.nitRuc}</span>
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
                  <span className={`badge-estado badge-${proveedorSeleccionado.estado.toLowerCase()}`}>
                    {proveedorSeleccionado.estado}
                  </span>
                </div>

                <div className="control-estado-panel">
                  <span className="control-estado-label">Cambiar Estado Operativo:</span>
                  <div className="botones-estado-group">
                    <button
                      className={`btn-cambio-estado btn-activo ${proveedorSeleccionado.estado === 'Activo' ? 'selected' : ''}`}
                      onClick={() => cambiarEstadoProveedor('Activo')}
                    >
                      <Power size={13} />
                      <span>Activo</span>
                    </button>
                    <button
                      className={`btn-cambio-estado btn-inactivo ${proveedorSeleccionado.estado === 'Inactivo' ? 'selected' : ''}`}
                      onClick={() => cambiarEstadoProveedor('Inactivo')}
                    >
                      <Power size={13} />
                      <span>Inactivo</span>
                    </button>
                    <button
                      className={`btn-cambio-estado btn-observado ${proveedorSeleccionado.estado === 'Observado' ? 'selected' : ''}`}
                      onClick={() => cambiarEstadoProveedor('Observado')}
                    >
                      <AlertCircle size={13} />
                      <span>Observado</span>
                    </button>
                    <button
                      className={`btn-cambio-estado btn-pendiente ${proveedorSeleccionado.estado === 'Pendiente' ? 'selected' : ''}`}
                      onClick={() => cambiarEstadoProveedor('Pendiente')}
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
                    <span className="field-value">{proveedorSeleccionado.direccion}</span>
                  </div>
                  <div className="dato-field">
                    <span className="field-label">Teléfono</span>
                    <span className="field-value">{proveedorSeleccionado.telefono}</span>
                  </div>
                  <div className="dato-field">
                    <span className="field-label">Correo Electrónico</span>
                    <span className="field-value">{proveedorSeleccionado.correo}</span>
                  </div>
                  <div className="dato-field">
                    <span className="field-label">Desempeño / Puntuacion </span>
                    <span className="field-value">{proveedorSeleccionado.puntajeDesempeno}% de cumplimiento</span>
                  </div>
                </div>
              </div>

              <div className="seccion-datos">
                <div className="seccion-header-flex">
                  <h3 className="seccion-titulo">Documentos del Proveedor</h3>
                  <button
                    className="btn-registrar-doc"
                    onClick={() => {
                      setErrorFormDoc('');
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
                        <th>Número</th>
                        <th>Vencimiento</th>
                        <th>Archivo Adjunto</th>
                        <th>Estado Doc.</th>
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
                              <span className={`doc-status status-${doc.estadoValidacion.toLowerCase()}`}>
                                {doc.estadoValidacion}
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
                <div className={`resultado-panel ${resultadoValidacion.esValido ? 'panel-exito' : 'panel-alerta'}`}>
                  <div className="resultado-header">
                    {resultadoValidacion.esValido ? (
                      <CheckCircle2 size={18} className="icon-exito" />
                    ) : (
                      <AlertCircle size={18} className="icon-alerta" />
                    )}
                    <span className="resultado-titulo">
                      {resultadoValidacion.esValido
                        ? 'Validación Exitosa: La información cumple los requisitos obligatorios'
                        : 'Validación Incompleta: Se detectaron inconsistencias u omisiones'}
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
        )}

        {activeIndex === 3 && (
          <div className="catalogo-productos-layout">
            <div className="selector-proveedor-card">
              <div className="selector-header">
                <div className="selector-info">
                  <span className="selector-label">Seleccionar Proveedor:</span>
                  <div className="select-wrapper">
                    <Building2 size={16} className="select-icon" />
                    <select
                      className="proveedor-dropdown"
                      value={proveedorSeleccionado.idProveedor}
                      onChange={(e) => {
                        const prov = proveedores.find(p => p.idProveedor === Number(e.target.value));
                        if (prov) {
                          setProveedorSeleccionado(prov);
                          setBusquedaProducto('');
                          setCategoriaFiltro('Todas');
                        }
                      }}
                    >
                      {proveedores.map((p) => (
                        <option key={p.idProveedor} value={p.idProveedor}>
                          {p.razonSocial} ({p.nitRuc})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="proveedor-meta-pills">
                  <span className={`badge-estado badge-${proveedorSeleccionado.estado.toLowerCase()}`}>
                    Estado: {proveedorSeleccionado.estado}
                  </span>
                  <span className="pill-metric">
                    Puntaje: <strong>{proveedorSeleccionado.puntajeDesempeno}%</strong>
                  </span>
                  <span className="pill-metric">
                    Productos: <strong>{proveedorSeleccionado.catalogoProductos.length}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="filtros-catalogo-bar">
              <div className="busqueda-box-amplia">
                <Search size={16} className="busqueda-icon" />
                <input
                  type="text"
                  placeholder="Buscar por SKU, Nombre o Descripción del producto..."
                  value={busquedaProducto}
                  onChange={(e) => setBusquedaProducto(e.target.value)}
                  className="busqueda-input"
                />
              </div>

              <div className="filtro-categoria-box">
                <Filter size={15} className="filtro-icon" />
                <select
                  className="categoria-dropdown"
                  value={categoriaFiltro}
                  onChange={(e) => setCategoriaFiltro(e.target.value)}
                >
                  {categoriasDisponibles.map((cat) => (
                    <option key={cat} value={cat}>Categoría: {cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="tabla-catalogo-card">
              <div className="tabla-header-info">
                <div className="titulo-tabla-group">
                  <Package size={18} className="icono-seccion" />
                  <h3 className="titulo-tabla">Catálogo Oficial de Productos</h3>
                </div>
                <span className="conteo-resultados">
                  Mostrando {productosFiltrados.length} de {proveedorSeleccionado.catalogoProductos.length} productos
                </span>
              </div>

              <div className="documentos-tabla-wrapper">
                <table className="documentos-tabla">
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Producto / Descripción</th>
                      <th>Categoría</th>
                      <th>Precio Pactado</th>
                      <th>Tiempo Estimado Entrega</th>
                      <th>Stock Dispon.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosFiltrados.length > 0 ? (
                      productosFiltrados.map((prod) => (
                        <tr key={prod.idProducto}>
                          <td>
                            <span className="sku-badge">
                              <Tag size={12} />
                              {prod.sku}
                            </span>
                          </td>
                          <td>
                            <div className="producto-info-cell">
                              <span className="producto-nombre">{prod.nombre}</span>
                              <span className="producto-desc">{prod.descripcion}</span>
                            </div>
                          </td>
                          <td>
                            <span className="categoria-tag">{prod.categoria}</span>
                          </td>
                          <td>
                            <span className="precio-pactado-tag">
                              {prod.precioPactado.toFixed(2)} Bs.
                            </span>
                            <span className="unidad-sub"> / {prod.unidadMedida}</span>
                          </td>
                          <td>
                            <div className="entrega-cell">
                              <Truck size={14} className="icon-truck" />
                              <span>{prod.tiempoEntregaEstimado}</span>
                            </div>
                          </td>
                          <td>
                            <span className="stock-val">
                              {prod.stockDisponible} {prod.unidadMedida}s
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="tabla-vacia">
                          {proveedorSeleccionado.catalogoProductos.length === 0
                            ? 'Este proveedor no cuenta con productos asociados en su catálogo.'
                            : 'No se encontraron productos que coincidan con la búsqueda.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeIndex === 4 && (
          <div className="dashboard-container">
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon-wrapper kpi-blue">
                  <TrendingUp size={20} />
                </div>
                <div className="kpi-content">
                  <span className="kpi-title">Promedio Desempeño</span>
                  <span className="kpi-value">{promedioDesempeno}%</span>
                  <span className="kpi-sub positive"><ArrowUpRight size={12} /> +4.2% este mes</span>
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
                  <span className="kpi-value">Logística Global</span>
                  <span className="kpi-sub">95% puntualidad</span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-wrapper kpi-amber">
                  <BarChart3 size={20} />
                </div>
                <div className="kpi-content">
                  <span className="kpi-title">Proveedores Activos</span>
                  <span className="kpi-value">{proveedores.filter(p => p.estado === 'Activo').length} / {proveedores.length}</span>
                  <span className="kpi-sub">Condición operativa</span>
                </div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <div className="chart-header">
                  <div>
                    <h3 className="chart-title">Desempeño y Calificación de Proveedores</h3>
                    <p className="chart-subtitle">Evaluación porcentual basada en cumplimiento de entrega y calidad</p>
                  </div>
                  <Award size={18} className="chart-header-icon" />
                </div>

                <div className="ranking-bars-list">
                  {proveedores.map((p) => (
                    <div key={p.idProveedor} className="ranking-item">
                      <div className="ranking-item-info">
                        <span className="ranking-name">{p.razonSocial}</span>
                        <span className="ranking-score">{p.puntajeDesempeno}%</span>
                      </div>
                      <div className="ranking-bar-track">
                        <div
                          className={`ranking-bar-fill ${p.puntajeDesempeno >= 85 ? 'fill-high' : p.puntajeDesempeno >= 60 ? 'fill-mid' : 'fill-low'}`}
                          style={{ width: `${p.puntajeDesempeno}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <div>
                    <h3 className="chart-title">Frecuencia de Compra (Últimos 6 meses)</h3>
                    <p className="chart-subtitle">Cantidad de órdenes de compra emitidas mensualmente</p>
                  </div>
                  <Calendar size={18} className="chart-header-icon" />
                </div>

                <div className="freq-bar-chart">
                  {datosFrecuenciaMensual.map((item) => {
                    const heightPercent = Math.round((item.ordenes / maxOrdenes) * 100);
                    return (
                      <div key={item.mes} className="freq-bar-col">
                        <div className="freq-bar-val">{item.ordenes}</div>
                        <div className="freq-bar-container">
                          <div
                            className="freq-bar"
                            style={{ height: `${heightPercent}%` }}
                          />
                        </div>
                        <span className="freq-bar-label">{item.mes}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Análisis de Volumen de Compra y Estado</h3>
              </div>
              <table className="documentos-tabla">
                <thead>
                  <tr>
                    <th>Proveedor</th>
                    <th>RUC</th>
                    <th>Estado</th>
                    <th>Órdenes Emitidas</th>
                    <th>Monto Acumulado</th>
                    <th>Puntuacion Desempeño</th>
                  </tr>
                </thead>
                <tbody>
                  {proveedores.map(p => (
                    <tr key={p.idProveedor}>
                      <td className="font-semibold">{p.razonSocial}</td>
                      <td>{p.nitRuc}</td>
                      <td>
                        <span className={`badge-estado badge-${p.estado.toLowerCase()}`}>
                          {p.estado}
                        </span>
                      </td>
                      <td>{p.ordenesCompra} órdenes</td>
                      <td>{p.montoTotalComprado.toLocaleString()} Bs.</td>
                      <td>
                        <span className="font-semibold">{p.puntajeDesempeno}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeIndex !== 0 && activeIndex !== 3 && activeIndex !== 4 && (
          <div className="catalogo-card">
            <p className="catalogo-card-text">
              Contenido correspondiente a: {menuItems[activeIndex]}
            </p>
          </div>
        )}
      </section>

      {modalDocAbierto && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Registrar Documento del Proveedor</h3>
                <span className="modal-subtitle">Asociar nuevo respaldo a: <strong>{proveedorSeleccionado.razonSocial}</strong></span>
              </div>
              <button className="btn-close-modal" onClick={() => setModalDocAbierto(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegistrarDocumento} className="modal-form">
              {errorFormDoc && (
                <div className="form-error-msg">
                  <AlertCircle size={14} />
                  <span>{errorFormDoc}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Tipo de Documento</label>
                <select
                  className="form-input"
                  value={nuevoDoc.tipoDocumento}
                  onChange={(e) => setNuevoDoc({ ...nuevoDoc, tipoDocumento: e.target.value })}
                >
                  <option value="Ficha RUC">Ficha RUC</option>
                  <option value="Certificado de Homologación">Certificado de Homologación</option>
                  <option value="Licencia de Funcionamiento">Licencia de Funcionamiento</option>
                  <option value="Estado Financiero Auditable">Estado Financiero Auditable</option>
                  <option value="Constancia de No Habido">Constancia de No Habido</option>
                  <option value="Certificación ISO / Calidad">Certificación ISO / Calidad</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Número / Código de Documento</label>
                <input
                  type="text"
                  placeholder="Ej. 20601234567 o CERT-2026-99"
                  className="form-input"
                  value={nuevoDoc.numeroDocumento}
                  onChange={(e) => setNuevoDoc({ ...nuevoDoc, numeroDocumento: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fecha de Vencimiento</label>
                <input
                  type="date"
                  className="form-input"
                  value={nuevoDoc.fechaVencimiento}
                  onChange={(e) => setNuevoDoc({ ...nuevoDoc, fechaVencimiento: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Archivo de Respaldo (.PDF / .ZIP)</label>
                <div className="upload-dropzone">
                  <Upload size={20} className="upload-icon" />
                  <span className="upload-text">
                    {nuevoDoc.archivoNombre ? nuevoDoc.archivoNombre : 'Seleccionar o arrastrar archivo PDF'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.zip"
                    className="file-input-hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setNuevoDoc({ ...nuevoDoc, archivoNombre: e.target.files[0].name });
                      }
                    }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => setModalDocAbierto(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  Guardar y Asociar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalogo;