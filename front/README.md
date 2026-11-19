# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## Disponibilidad de mercadería para despacho

Al confirmar la disponibilidad, Recepción y Control persiste un evento
`MercaderiaDisponible` en el estado local de compras y trata de enviarlo de
forma asíncrona al publicador configurado por `VITE_MERCADERIA_DISPONIBLE_API`.
Ese endpoint debe ser una API de confianza que publique en el tópico Pub/Sub de
Gestión de Entregas/Despachos; el frontend no accede directamente a credenciales
ni a Google Pub/Sub.

El publicador recibe el JSON del evento y el encabezado `Idempotency-Key` con el
ID del evento. Una respuesta HTTP exitosa marca el evento como publicado; si
incluye el encabezado `x-message-id`, se conserva como referencia. Sin endpoint,
el evento queda guardado con estado pendiente de configuración. No se debe
configurar aquí un endpoint de alertas de inventario con otro contrato.

La vista conserva el historial y el resultado de cada intento. Solo se puede
reintentar un evento pendiente o fallido; los eventos publicados no se vuelven
a enviar. Si la aplicación se interrumpe durante un envío, su resultado se
marca como incierto y queda reintentable con la misma clave de idempotencia.
Para evitar duplicados cuando el servidor recibió el primer intento pero la
respuesta se perdió, el endpoint configurado debe aplicar idempotencia usando
esa clave. Un HTTP exitoso confirma la aceptación del endpoint, no el consumo
del evento por Gestión de Entregas/Despachos.

La vista distingue la publicación del resultado posterior de Entregas/Despachos.
El estado queda pendiente hasta que el resultado sea entregado a la aplicación.
El procesador local `registrarResultadoDisponibilidad` verifica el
`correlationId`, el `recepcionId` y que el evento haya sido publicado; persiste
una sola respuesta por evento e ignora duplicados idénticos. Un rechazo no
confirma la disponibilidad. El repositorio todavía no contiene una suscripción
de resultados ni el contrato acordado con SCRUM-540, por lo que no se generan
respuestas simuladas.

Al procesar un resultado, el estado compartido conserva el ID del evento
original, el ID de mensaje Pub/Sub cuando lo entrega el consumidor, la fecha de
recepción y el resultado. Los mensajes inválidos o no correlacionados se
registran en la lista de errores visible en la vista; si se provee el mismo ID
de mensaje, el error no se registra dos veces. Para completar la integración,
el servicio receptor deberá adaptar el mensaje real, persistirlo en el backend
y confirmar Pub/Sub solo después de persistirlo. Ese consumidor aún requiere
definir el servicio receptor, la suscripción y el formato real del mensaje; el
frontend no puede conectarse directamente a Pub/Sub de forma segura. La
función local procesa un resultado ya entregado a la aplicación; no es una
suscripción ni transporta mensajes por sí sola.

## Conciliación de recepción con orden de compra

En una recepción inspeccionada, el historial permite ejecutar una conciliación.
El frontend consulta la orden por HTTP GET usando `VITE_ORDEN_COMPRA_API` como
ruta base y agregando `/{idOrden}`. La respuesta debe ser una orden JSON con
`idOrden`, `numero` y `detalles` con `idDetalle`, `cantidad`, y
`producto.descripcion`. Por ejemplo, si la base es
`http://localhost:8080/api/ordenes`, para la orden 123 se solicita
`GET http://localhost:8080/api/ordenes/123`.

No se encontró esa ruta implementada en los microservicios de este repositorio;
Backend debe proveerla/configurar CORS y definir el endpoint real antes de que
la consulta funcione en el entorno integrado. La conciliación compara por
`idDetalleOrden`: solicitada, recibida, aceptada y diferencias. La cantidad
aceptada procede de la validación final local; si no existe, se muestra como
pendiente y la conciliación no se declara conforme. Diferencias de cantidades,
líneas faltantes/extra o aceptación pendiente bloquean el resultado conforme.

## Envío de órdenes confirmadas a Contabilidad

Al registrar una respuesta **Confirmada** para una orden enviada, el frontend
guarda la respuesta y el evento `OrdenCompraConfirmada` juntos en el almacén
local. El evento incluye `idEvento`, `correlationId`, `idOrden`, número y fecha
de orden, proveedor, referencia y fecha de confirmación, total y líneas con
producto, cantidad, precio y subtotal.

Después intenta publicar el JSON de forma asíncrona con `POST` a
`VITE_ORDEN_COMPRA_CONTABILIDAD_API`, enviando el `idEvento` como
`Idempotency-Key`. La respuesta HTTP exitosa significa que el endpoint aceptó
el evento; no confirma que Contabilidad lo haya procesado. Los errores y los
intentos quedan visibles junto a la respuesta del proveedor. El evento conserva
su mismo identificador al reintentar.

No se encontró un endpoint ni un contrato de evento de órdenes hacia
Contabilidad en los microservicios de este repositorio. Backend debe
implementar el endpoint configurado para persistir/publicar el evento en el
tópico Pub/Sub acordado y aplicar idempotencia. Los endpoints Pub/Sub existentes
publican mensajes de prueba o alertas de inventario y no son compatibles con
este evento. La respuesta del proveedor se registra actualmente desde el
frontend; no se consulta ni verifica mediante un servicio externo.

## Resultado de Contabilidad para órdenes confirmadas

El procesador frontend
`registrarResultadoOrdenCompraContabilidad` acepta una respuesta ya entregada
por la integración, valida que `idEvento`, `correlationId` e `idOrden`
correspondan exactamente a un evento publicado y conserva el resultado y la
fecha de recepción en el almacén local. Los estados esperados son
`CompromisoRegistrado` y `Rechazado`; el rechazo debe incluir `motivoRechazo`.
Puede incluir `idCompromisoContable` e `idMensajePubSub`. La vista del detalle
de la orden muestra el resultado, o indica que sigue pendiente. Una repetición
idéntica no se procesa de nuevo; respuestas incompatibles o no correlacionadas
se registran como errores.

Esta función procesa mensajes que otra capa haya entregado; no abre una
suscripción Pub/Sub ni recibe mensajes por sí sola. El repositorio no contiene
una suscripción de Contabilidad ni un canal para entregar sus resultados al
frontend. Backend debe implementar el consumidor Pub/Sub y acordar un canal de
entrega seguro (por ejemplo, API autenticada, SSE o WebSocket) que invoque o
adapte este procesador. El consumidor debe confirmar el mensaje Pub/Sub solo
después de persistir el resultado. No se simulan respuestas de Contabilidad.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
