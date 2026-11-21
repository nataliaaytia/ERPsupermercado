/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_PROVEEDORES?: string;
  readonly VITE_API_COTIZACIONES?: string;
  readonly VITE_USAR_DATOS_PRUEBA?: string;
  readonly VITE_ORDEN_COMPRA_API?: string;
  readonly VITE_ORDEN_COMPRA_CONTABILIDAD_API?: string;
  readonly VITE_MERCADERIA_DISPONIBLE_API?: string;
}
