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
