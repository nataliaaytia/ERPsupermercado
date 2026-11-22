# Frontend · ERP Supermercado (Compras y Proveedores)

React 19 + TypeScript + Vite + React Router.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # compila y verifica tipos
npm run lint
```

Usuarios de prueba: ver `src/data/usuarios.json` (o el desplegable en la pantalla de login).

## Estructura de carpetas

```
src/
├── app/                 # App, rutas y registro de módulos (modulos.ts)
├── componentes/
│   ├── layout/          # Cabecera, MenuLateral, EncabezadoPagina, LayoutModulo (compartidos)
│   ├── ui/              # Componentes reutilizables (Notificacion, SiguientePaso)
│   └── efectos/         # Animaciones de la portada
├── contexto/            # Tema (día/noche) y sesión
├── data/                # ← TODOS los datos de prueba (JSON). Ver data/README.md
├── estado/              # Almacén global compartido por todos los módulos
├── estilos/             # tema.css (paleta única) y base.css (clases comunes)
├── hooks/               # Hooks genéricos
├── modulos/             # Un folder por microservicio del backend
│   ├── proveedores/
│   ├── requisiciones/
│   ├── ordenesCompra/
│   ├── recepcion/
│   └── facturacion/
├── paginas/             # Inicio, Login, 404
├── servicios/           # datosPrueba.ts (lectura de /data) y api/ (cliente HTTP + endpoints)
└── utilidades/          # Fechas y formato de moneda
```

Cada módulo sigue la misma forma:

```
modulos/<modulo>/
├── modulo.tsx      # Configuración: título, icono, secciones del menú y rutas
├── vistas.tsx      # Pantallas conectadas al almacén (una por sección)
├── paginas/        # Pantallas (presentación + formularios)
├── componentes/    # Piezas usadas por las páginas
├── servicios/      # Reglas de negocio puras (validaciones, cálculos, acciones)
├── hooks/          # (opcional)
└── tipos/          # Interfaces TypeScript del módulo
```

## Convenciones

- **Colores**: solo variables de `estilos/tema.css` (`var(--accent)`, `var(--danger)`, …).
  Nada de colores fijos: así día y noche funcionan en todas las pantallas.
- **Layout**: ninguna pantalla dibuja su propia cabecera ni menú; los da `LayoutModulo`.
  Para agregar una pantalla, añadir una sección en el `modulo.tsx` correspondiente.
- **Datos**: ninguna pantalla importa `/data`. Se lee con `servicios/datosPrueba.ts`
  y se comparte con `useCompras()`. Para conectar el backend, reemplazar esas funciones
  por llamadas de `servicios/api/endpoints.ts` (configurar `.env.local` desde `.env.example`).
- **Flujo**: al terminar una etapa, la pantalla muestra `<SiguientePaso>` con el enlace a la siguiente.

## Flujo del sistema

Proveedores → Requisiciones (alerta de inventario → requisición → aprobación → cotización →
ofertas → adjudicación) → Órdenes de compra (borrador → aprobación → envío → confirmación →
compromisos → seguimiento → cierre) → Recepción (registro → inspección → discrepancias →
revisión final → devoluciones → disponibilidad) → Facturación (registro → 3-way matching → pagos).

