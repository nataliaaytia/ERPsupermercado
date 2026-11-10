import { estadoInicial } from "./modeloCompras";
import type { AccionCompras, EstadoCompras } from "./modeloCompras";
import { reducirComprasConHistorial } from "./historialRequisiciones";
import type { OrdenCompra, RecepcionValidada } from "../servicioOrdenesCompra/tipos";
import { proveedoresIniciales } from "../catalogo/datosProveedores";

import type { RecepcionRegistrada } from "../servicioRecepcionControl/tiposRecepcion";

const CLAVE = "erp-compras-estado";
const CLAVE_ANTERIOR_ORDENES = "erp-ordenes-compra";


interface EstadoCompartido extends EstadoCompras {
    ordenes: OrdenCompra[];
    recepcionesValidadas: RecepcionValidada[];
    recepcionesRegistradas: RecepcionRegistrada[];
    ejemploInicializado: boolean;
    errorCarga: string;
}

let estado: EstadoCompartido | undefined;

const oyentes = new Set<() => void>();

export function fechaHoy(): string {
    const fecha = new Date();

    return [
        fecha.getFullYear(),
        String(fecha.getMonth() + 1).padStart(2, "0"),
        String(fecha.getDate()).padStart(2, "0"),
    ].join("-");
}

function siguiente(ids: number[]): number {
    return ids.reduce(
        (maximo, id) => Math.max(maximo, id),
        0,
    ) + 1;
}

function agregarEjemplo(
    actual: EstadoCompartido,
): EstadoCompartido {
    if (actual.ejemploInicializado) return actual;

    const proveedor = proveedoresIniciales.find(
        item => item.estado === "Activo",
    );

    if (!proveedor) {
        throw new Error(
            "No hay un proveedor activo para el ejemplo.",
        );
    }

    const hoy = fechaHoy();
    const limite = new Date(`${hoy}T12:00:00`);

    limite.setDate(limite.getDate() + 30);

    const fechaLimite = [
        limite.getFullYear(),
        String(limite.getMonth() + 1).padStart(2, "0"),
        String(limite.getDate()).padStart(2, "0"),
    ].join("-");

    const idRequisicion = siguiente(
        actual.requisiciones.map(item => item.idRequisicion),
    );

    const idSolicitud = siguiente(
        actual.solicitudes.map(item => item.idSolicitud),
    );

    const idOferta = siguiente(
        actual.ofertas.map(item => item.idOferta),
    );

    const productos = [
        ...actual.requisiciones.flatMap(item =>
            item.detalles.map(linea => linea.producto),
        ),
        ...actual.ofertas.flatMap(item =>
            item.detalles.map(linea => linea.producto),
        ),
        ...actual.ordenes.flatMap(item =>
            item.detalles.map(linea => linea.producto),
        ),
        ...proveedoresIniciales.flatMap(
            item => item.catalogoProductos,
        ),
    ];

    const producto = {
        idProducto: siguiente(
            productos.map(item => item.idProducto),
        ),
        descripcion: "Papel bond tamaño carta - ejemplo",
    };

    return {
        ...actual,
        ejemploInicializado: true,
        requisiciones: [
            ...actual.requisiciones,
            {
                idRequisicion,
                fecha: hoy,
                prioridad: "Media",
                estado: "Aprobada",
                solicitante: "Compras - ejemplo",
                observacion:
                    "Compra de prueba para recorrer el flujo de órdenes y entregas.",
                detalles: [
                    {
                        idDetalle: 1,
                        producto,
                        cantidad: 10,
                        observacion: "Dato de prueba",
                    },
                ],
            },
        ],
        solicitudes: [
            ...actual.solicitudes,
            {
                idSolicitud,
                requisicion: idRequisicion,
                fecha: hoy,
                fechaLimite,
                estado: "Enviada",
                proveedoresIds: [proveedor.idProveedor],
            },
        ],
        ofertas: [
            ...actual.ofertas,
            {
                idOferta,
                proveedor: {
                    idProveedor: proveedor.idProveedor,
                    razonSocial: proveedor.razonSocial,
                    nitRuc: proveedor.nitRuc,
                    estado: proveedor.estado,
                },
                solicitud: idSolicitud,
                fecha: hoy,
                validez: fechaLimite,
                estado: "Seleccionada",
                descuento: 0,
                condicionesEntrega:
                    "Entrega de prueba en almacén central.",
                detalles: [
                    {
                        idDetalle: 1,
                        producto,
                        precio: 25,
                        plazoEntrega: 3,
                    },
                ],
            },
        ],
    };
}

export function obtenerCompras(): EstadoCompartido {
    if (estado) return estado;

    const inicial: EstadoCompartido = {
        ...estadoInicial,
        ordenes: [],
        recepcionesValidadas: [],
        recepcionesRegistradas: [],
        ejemploInicializado: false,
        errorCarga: "",
    };

    try {
        const guardado = localStorage.getItem(CLAVE);

        const datos: unknown =
            guardado === null ? {} : JSON.parse(guardado);

        if (
            typeof datos !== "object" ||
            datos === null ||
            Array.isArray(datos)
        ) {
            throw new Error("Los datos de compras no son válidos.");
        }

        const anterior = datos as Partial<EstadoCompartido>;

        if (
            guardado !== null &&
            (
                !Array.isArray(anterior.requisiciones) ||
                !Array.isArray(anterior.solicitudes) ||
                !Array.isArray(anterior.ofertas)
            )
        ) {
            throw new Error("Los datos de compras no son válidos.");
        }

        let ordenes = anterior.ordenes;

        if (ordenes === undefined) {
            const legado = localStorage.getItem(
                CLAVE_ANTERIOR_ORDENES,
            );

            ordenes = legado === null ? [] : JSON.parse(legado);
        }

        if (!Array.isArray(ordenes)) {
            throw new Error("Las órdenes guardadas no son válidas.");
        }

        const nuevo = agregarEjemplo({
            ...inicial,
            ...anterior,
            requisiciones: anterior.requisiciones ?? [],
            solicitudes: anterior.solicitudes ?? [],
            ofertas: anterior.ofertas ?? [],
            alertasInventario: anterior.alertasInventario ?? [],
            historialProcesamientos: anterior.historialProcesamientos ?? [],
            ordenes,
            recepcionesValidadas: anterior.recepcionesValidadas ?? [],
            recepcionesRegistradas: anterior.recepcionesRegistradas ?? [],
            ejemploInicializado: anterior.ejemploInicializado === true,
            errorCarga: "",
            mensaje: "",
            tipoMensaje: "neutro",
        });

        localStorage.setItem(CLAVE, JSON.stringify(nuevo));

        estado = nuevo;
    } catch {
        estado = {
            ...inicial,
            errorCarga:
                "No se pudieron cargar o guardar las compras. No se reemplazaron los datos existentes.",
            mensaje: "No se pudieron cargar los datos de compras.",
            tipoMensaje: "error",
        };
    }

    return estado;
}

export function suscribirCompras(
    oyente: () => void,
): () => void {
    oyentes.add(oyente);

    return () => {
        oyentes.delete(oyente);
    };
}

export function actualizarCompras(
    actualizar: (actual: EstadoCompartido) => EstadoCompartido,
): void {
    const actual = obtenerCompras();

    if (actual.errorCarga) {
        throw new Error(actual.errorCarga);
    }

    const nuevo = actualizar(actual);

    if (nuevo === actual) return;

    localStorage.setItem(CLAVE, JSON.stringify(nuevo));

    estado = nuevo;

    oyentes.forEach(oyente => oyente());
}

export function despacharCompras(accion: AccionCompras): void {
    actualizarCompras(actual => ({
        ...actual,
        ...reducirComprasConHistorial(actual, {
            accion,
            fecha: new Date().toISOString(),
        }),
        ordenes: actual.ordenes,
        recepcionesValidadas: actual.recepcionesValidadas,
        recepcionesRegistradas: actual.recepcionesRegistradas,
        ejemploInicializado: actual.ejemploInicializado,
        errorCarga: actual.errorCarga,
    }));
}