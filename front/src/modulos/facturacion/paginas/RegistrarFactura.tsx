import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompras } from '../../../estado/useCompras';
import { catalogos } from '../../../config/catalogos';
import { fechaHoy } from '../../../utilidades/fechas';
import { moneda, redondear } from '../../../utilidades/formato';
import type { OrdenCompra } from '../../ordenesCompra/tipos';
import { lineasFacturables, ordenesFacturables, proveedorDeOrden, registrarFactura } from '../servicios/facturas';
import { conciliarConRecepciones } from '../servicios/conciliacionRecepciones';
import ConciliacionRecepciones from '../componentes/ConciliacionRecepciones';
import { analizarDiferenciasPrecio } from '../servicios/diferenciasPrecio';
import DiferenciasPrecio from '../componentes/DiferenciasPrecio';

interface LineaFormulario {
  cantidad: string;
  precioUnitario: string;
}

function FormularioFactura({ orden }: { orden: OrdenCompra }) {
  const compras = useCompras();
  const navegar = useNavigate();
  const lineas = lineasFacturables(compras, orden);
  const proveedor = proveedorDeOrden(compras, orden);

  const [numeroFactura, setNumeroFactura] = useState('');
  const [fechaEmision, setFechaEmision] = useState(fechaHoy);
  const [condicionPago, setCondicionPago] = useState<string>(catalogos.condicionesPagoFactura[0].codigo);
  const [error, setError] = useState('');
  // Se propone facturar lo aceptado pendiente al precio de la orden.
  const [valores, setValores] = useState<Record<number, LineaFormulario>>(() =>
    Object.fromEntries(
      lineas.map((linea) => [
        linea.idDetalleOrden,
        {
          cantidad: linea.cantidadPorFacturar > 0 ? String(linea.cantidadPorFacturar) : '',
          precioUnitario: String(linea.precioUnitario),
        },
      ]),
    ),
  );

  const total = redondear(
    Object.values(valores).reduce(
      (suma, valor) => suma + (Number(valor.cantidad) || 0) * (Number(valor.precioUnitario) || 0),
      0,
    ),
  );

  // SCRUM-673: conciliación en vivo con las recepciones parciales de la orden.
  const conciliacion = conciliarConRecepciones(
    compras,
    orden.idOrden,
    new Map(Object.entries(valores).map(([id, valor]) => [Number(id), Number(valor.cantidad) || 0])),
  );
  const excedeLoAceptado = conciliacion !== null && !conciliacion.conforme;

  // SCRUM-674: diferencias de precio frente a la orden, en vivo.
  const diferenciasPrecio = analizarDiferenciasPrecio(
    compras,
    orden.idOrden,
    Object.entries(valores).map(([id, valor]) => ({
      idDetalleOrden: Number(id),
      cantidad: Number(valor.cantidad) || 0,
      precioUnitario: Number(valor.precioUnitario) || 0,
    })),
  );

  const cambiar = (id: number, campo: keyof LineaFormulario, valor: string) =>
    setValores((actuales) => ({ ...actuales, [id]: { ...actuales[id], [campo]: valor } }));

  const guardar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setError('');
    try {
      registrarFactura({
        numeroFactura,
        idOrden: orden.idOrden,
        fechaEmision,
        condicionPago,
        detalles: Object.entries(valores).map(([id, valor]) => ({ idDetalleOrden: Number(id), ...valor })),
      });
      navegar('/facturacion/validacion');
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo registrar la factura.');
    }
  };

  return (
    <form className="tarjeta" onSubmit={guardar} noValidate>
      <h2>Factura de {proveedor?.razonSocial ?? 'proveedor'} · {orden.numero}</h2>

      <div className="fila-campos">
        <label className="campo">
          Número de factura
          <input value={numeroFactura} onChange={(e) => setNumeroFactura(e.target.value)} placeholder="Ej. F-001245" required />
        </label>
        <label className="campo">
          NIT del proveedor
          <input value={proveedor?.nitRuc ?? ''} readOnly />
        </label>
        <label className="campo">
          Fecha de emisión
          <input type="date" value={fechaEmision} max={fechaHoy()} onChange={(e) => setFechaEmision(e.target.value)} required />
        </label>
        <label className="campo">
          Condición de pago
          <select value={condicionPago} onChange={(e) => setCondicionPago(e.target.value)}>
            {catalogos.condicionesPagoFactura.map((condicion) => (
              <option key={condicion.codigo} value={condicion.codigo}>
                {condicion.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="tabla-contenedor">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Ordenadas</th>
              <th>Aceptadas</th>
              <th>Ya facturadas</th>
              <th>Cantidad facturada</th>
              <th>Precio unitario (Bs)</th>
            </tr>
          </thead>
          <tbody>
            {lineas.map((linea) => (
              <tr key={linea.idDetalleOrden}>
                <td>{linea.descripcion}</td>
                <td>{linea.cantidadOrdenada}</td>
                <td>{linea.cantidadAceptada}</td>
                <td>{linea.cantidadFacturada}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    aria-label={`Cantidad facturada de ${linea.descripcion}`}
                    value={valores[linea.idDetalleOrden]?.cantidad ?? ''}
                    onChange={(e) => cambiar(linea.idDetalleOrden, 'cantidad', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    aria-label={`Precio unitario de ${linea.descripcion}`}
                    value={valores[linea.idDetalleOrden]?.precioUnitario ?? ''}
                    onChange={(e) => cambiar(linea.idDetalleOrden, 'precioUnitario', e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="texto-secundario">
        Se proponen las cantidades aceptadas en recepción al precio de la orden. Si la factura física
        dice otra cosa, cámbialo: la validación de tres vías detectará las diferencias.
      </p>

      {conciliacion && <ConciliacionRecepciones resultado={conciliacion} />}
      {diferenciasPrecio && <DiferenciasPrecio resultado={diferenciasPrecio} />}

      <div className="resumen">
        <span>Total facturado:</span>
        <strong>{moneda(total)}</strong>
      </div>

      {error && (
        <p className="alerta alerta--error" role="alert">
          {error}
        </p>
      )}

      <div className="acciones">
        <button type="submit" disabled={excedeLoAceptado}>
          Registrar factura
        </button>
      </div>
    </form>
  );
}

/** Registro de la factura comercial del proveedor para una orden recibida. */
export default function RegistrarFactura() {
  const compras = useCompras();
  const [idOrden, setIdOrden] = useState('');
  const disponibles = ordenesFacturables(compras);
  const orden = disponibles.find((item) => String(item.idOrden) === idOrden);

  if (disponibles.length === 0) {
    return (
      <p className="estado-vacio">
        No hay órdenes con mercadería aceptada pendiente de facturar. Primero registra y valida la recepción
        (Recepción → Revisión final).
      </p>
    );
  }

  return (
    <>
      <label className="campo">
        Orden de compra recibida
        <select value={idOrden} onChange={(e) => setIdOrden(e.target.value)}>
          <option value="">Selecciona una orden</option>
          {disponibles.map((item) => (
            <option key={item.idOrden} value={item.idOrden}>
              {item.numero} · {proveedorDeOrden(compras, item)?.razonSocial ?? 'Proveedor'}
            </option>
          ))}
        </select>
      </label>

      {orden && <FormularioFactura key={orden.idOrden} orden={orden} />}
    </>
  );
}
