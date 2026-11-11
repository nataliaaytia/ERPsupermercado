
import { useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { simularEnvioOrden } from "./simulacionEnvioOrden";
import type {
  OrdenCompra,
  RegistroEnvioOrden,
} from "./tipos";
import "./EnvioOrdenProveedor.css";

interface Props {
  orden: OrdenCompra;
  proveedor: string;
}

function moneda(valor: number): string {
  return `Bs ${valor.toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function EnvioOrdenProveedor({
  orden,
  proveedor,
}: Props) {
  const dialogoRef = useRef<HTMLDialogElement>(null);
  const tituloId = useId();

  const [canal, setCanal] = useState(
    "Correo electrónico (simulado)"
  );

  const [resultadoPrueba, setResultadoPrueba] = useState<
    "Exitoso" | "Fallido"
  >("Exitoso");

  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  const historial = orden.historialEnvios ?? [];

  const envioExitoso = historial.some(
    (intento) => intento.estado === "Exitoso"
  );

  const ultimoIntento: RegistroEnvioOrden | undefined =
    historial[historial.length - 1];

  const ordenAprobada = orden.estado === "Aprobada";
  const ordenEnviada = orden.estado === "Enviada";

  const puedeEnviar =
    ordenAprobada &&
    !envioExitoso &&
    proveedor.trim() !== "" &&
    proveedor !== "No disponible";

  function abrirVistaPrevia() {
    if (!puedeEnviar || procesando) return;

    setError("");
    dialogoRef.current?.showModal();
  }

  function cerrarVistaPrevia() {
    if (procesando) return;

    dialogoRef.current?.close();
  }

  function confirmarEnvio(
    evento: FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    if (!puedeEnviar || procesando) return;

    setProcesando(true);
    setError("");

    try {
      simularEnvioOrden({
        idOrden: orden.idOrden,
        proveedor,
        canal,
        resultado: resultadoPrueba,
      });

      dialogoRef.current?.close();
    } catch (fallo) {
      setError(
        fallo instanceof Error
          ? fallo.message
          : "No se pudo realizar la simulación."
      );
    } finally {
      setProcesando(false);
    }
  }

  // Mostrar el componente en ambos estados.
  // Solo permitir enviar cuando la orden está Aprobada.
  if (!ordenAprobada && !ordenEnviada) {
    return null;
  }

  return (
    <section className="envio-proveedor">
      <div className="envio-proveedor__encabezado">
        <div>
          <h3>Envío al proveedor</h3>
          <p>
            {ordenEnviada
              ? "Consulta los resultados registrados del envío al proveedor."
              : "Simula el envío de una orden aprobada y consulta los resultados registrados."}
          </p>
        </div>

        {puedeEnviar && (
          <button
            type="button"
            className="envio-proveedor__principal"
            onClick={abrirVistaPrevia}
            disabled={procesando}
          >
            {ultimoIntento?.estado === "Fallido"
              ? "Reintentar envío"
              : "Enviar al proveedor"}
          </button>
        )}
      </div>

      {(envioExitoso || ordenEnviada) && (
        <p
          className="envio-proveedor__exito"
          role="status"
        >
          La orden ya fue enviada al proveedor.
          No se permiten envíos duplicados.
        </p>
      )}

      {ordenAprobada &&
        !envioExitoso &&
        ultimoIntento?.estado === "Fallido" && (
          <p
            className="envio-proveedor__error"
            role="alert"
          >
            El último intento falló. Puedes volver a intentarlo.
          </p>
        )}

      {ordenAprobada &&
        !puedeEnviar &&
        !envioExitoso &&
        proveedor.trim() === "" && (
          <p
            className="envio-proveedor__error"
            role="alert"
          >
            No se puede simular el envío porque falta
            información válida del proveedor.
          </p>
        )}

      {ordenAprobada &&
        !puedeEnviar &&
        !envioExitoso &&
        proveedor === "No disponible" && (
          <p
            className="envio-proveedor__error"
            role="alert"
          >
            No se puede simular el envío porque falta
            información válida del proveedor.
          </p>
        )}

      {historial.length > 0 && (
        <div className="envio-proveedor__historial">
          <h4>Historial de envíos simulados</h4>

          <div className="envio-proveedor__tabla">
            <table>
              <thead>
                <tr>
                  <th>Intento</th>
                  <th>Fecha</th>
                  <th>Canal</th>
                  <th>Resultado</th>
                </tr>
              </thead>

              <tbody>
                {historial.map((intento) => (
                  <tr key={intento.idIntento}>
                    <td>#{intento.idIntento}</td>
                    <td>
                      {new Date(
                        intento.fecha
                      ).toLocaleString("es-BO")}
                    </td>
                    <td>{intento.canal}</td>
                    <td>{intento.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {ordenEnviada && historial.length === 0 && (
        <p className="envio-proveedor__aviso">
          Esta orden figura como enviada, pero no tiene
          intentos de envío simulados registrados.
        </p>
      )}

      {ordenAprobada && (
        <dialog
          ref={dialogoRef}
          className="envio-proveedor__dialogo"
          aria-labelledby={tituloId}
          onCancel={(evento) => {
            if (procesando) {
              evento.preventDefault();
            }
          }}
        >
          <form onSubmit={confirmarEnvio}>
            <h3 id={tituloId}>
              Confirmar envío al proveedor
            </h3>

            <p className="envio-proveedor__aviso">
              Esta es una simulación. No se enviará ningún
              correo ni documento real.
            </p>

            <div className="envio-proveedor__datos">
              <p>
                <strong>Orden:</strong> {orden.numero}
              </p>
              <p>
                <strong>Proveedor:</strong> {proveedor}
              </p>
              <p>
                <strong>Fecha:</strong> {orden.fecha}
              </p>
              <p>
                <strong>Estado:</strong> {orden.estado}
              </p>
            </div>

            <h4>Productos incluidos</h4>

            <div className="envio-proveedor__tabla">
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>

                <tbody>
                  {orden.detalles.map((detalle) => (
                    <tr key={detalle.idDetalle}>
                      <td>
                        {detalle.producto.descripcion}
                      </td>
                      <td>{detalle.cantidad}</td>
                      <td>
                        {moneda(detalle.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="envio-proveedor__total">
              <strong>
                Total: {moneda(orden.total)}
              </strong>
            </p>

            <label className="envio-proveedor__campo">
              Canal de envío
              <select
                value={canal}
                onChange={(evento) =>
                  setCanal(evento.target.value)
                }
                disabled={procesando}
              >
                <option value="Correo electrónico (simulado)">
                  Correo electrónico (simulado)
                </option>
                <option value="Portal de proveedores (simulado)">
                  Portal de proveedores (simulado)
                </option>
              </select>
            </label>

            <label className="envio-proveedor__campo">
              Resultado de prueba
              <select
                value={resultadoPrueba}
                onChange={(evento) =>
                  setResultadoPrueba(
                    evento.target.value as
                      | "Exitoso"
                      | "Fallido"
                  )
                }
                disabled={procesando}
              >
                <option value="Exitoso">
                  Simular envío exitoso
                </option>
                <option value="Fallido">
                  Simular fallo de envío
                </option>
              </select>
            </label>

            {error && (
              <p
                className="envio-proveedor__error"
                role="alert"
              >
                {error}
              </p>
            )}

            <div className="envio-proveedor__acciones">
              <button
                type="button"
                className="envio-proveedor__secundario"
                onClick={cerrarVistaPrevia}
                disabled={procesando}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="envio-proveedor__principal"
                disabled={procesando || !puedeEnviar}
              >
                {procesando
                  ? "Procesando..."
                  : "Confirmar envío simulado"}
              </button>
            </div>
          </form>
        </dialog>
      )}
    </section>
  );
}
