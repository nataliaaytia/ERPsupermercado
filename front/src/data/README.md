# Datos de prueba

Todos los datos de ejemplo del frontend viven en esta carpeta, en formato JSON
(el mismo formato que intercambiará el backend por REST).

**Ninguna pantalla importa estos archivos directamente.** Se leen únicamente a
través de `src/servicios/datosPrueba.ts`, que los tipa y los entrega al almacén
global (`src/estado/almacenCompras.ts`). Para conectar el backend basta con
reemplazar esas funciones por llamadas a la API (`src/servicios/api`).

| Archivo | Contenido | Endpoint equivalente en el backend |
|---|---|---|
| `productos.json` | Maestro de productos del supermercado | (tabla `producto` de ms-proveedores) |
| `proveedores.json` | Proveedores, documentos, descuentos y catálogo (`catalogo` referencia a `productos.json` por `idProducto`) | `GET /proveedores`, `GET /proveedores/{id}/catalogo` |
| `metricasProveedores.json` | % de productos aceptados y entregas completas | `GET /proveedores/indicadores` |
| `frecuenciaMensual.json` | Órdenes por mes (gráfico de ranking) | `GET /proveedores/ordenes/frecuencia-mensual` |
| `alertasInventario.json` | Alertas de reposición publicadas por Inventarios | `POST /api/pubsub/procesar-alerta` |
| `requisiciones.json` | Requisiciones en distintos estados | `GET /api/requisiciones/{id}` |
| `solicitudesCotizacion.json` | Solicitudes de cotización | `GET /api/solicitudes-cotizacion` |
| `ofertas.json` | Ofertas de proveedores | `POST /api/ofertas`, comparativas |
| `ordenesCompra.json` | Órdenes de compra (una ya confirmada, lista para recepción) | (microservicio de órdenes, pendiente) |
| `eventosContabilidad.json` | Orden confirmada pendiente de enviar a Contabilidad (botón "Intentar publicación" en el detalle de OC-0001) | — |
| `recepciones.json` | Entrega parcial de OC-0001 ya inspeccionada y validada (habilita "Disponibilidad para despacho") | — |
| `facturas.json` | Facturas registradas | (microservicio de facturación, pendiente) |
| `usuarios.json` | Usuarios de prueba por rol | `POST /auth/login` |
| `catalogos.json` | Listas fijas: prioridades, tipos de documento, condiciones de pago, tolerancia del matching | — |

## Fechas

Las fechas están escritas respecto al **21/11/2026** (`FECHA_REFERENCIA` en
`datosPrueba.ts`). Al cargarse se desplazan al día actual, así los plazos de
cotización, vencimientos de documentos y validez de ofertas siguen siendo
coherentes sin importar cuándo se ejecute la demo.

## Recorrido sugerido con estos datos

0. **Proveedores**: registra un proveedor, actívalo y asóciale productos.
1. **Requisiciones → Alertas de inventario**: procesar una alerta genera una requisición.
2. **Aprobar requisiciones**: REQ-0001 se aprueba; REQ-0007 tiene errores a propósito.
3. **Cotizaciones y ofertas**: COT-0001 tiene 2 ofertas para comparar y adjudicar.
4. **Órdenes de compra → Generar orden** desde la oferta adjudicada (o la de COT-0003, ya adjudicada).
5. **Recepción**: OC-0001 ya está confirmada; registrar la entrega, inspeccionar y hacer la revisión final.
6. **Facturación**: registrar la factura de OC-0001 y validarla con el 3-way matching.

Los cambios se guardan en el navegador (localStorage). El botón ↺ de la
cabecera descarta los cambios y vuelve a cargar estos archivos.
