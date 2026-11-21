import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/** Una pantalla dentro de un módulo (una opción del menú lateral). */
export interface SeccionModulo {
  /** Segmento de la URL, relativo a la ruta del módulo (p. ej. "nueva"). */
  ruta: string;
  etiqueta: string;
  descripcion: string;
  elemento: ReactNode;
  /** Rutas con parámetros u ocultas que no se muestran en el menú. */
  oculta?: boolean;
}

/** Configuración de un módulo: alimenta la cabecera, el menú lateral, las rutas y el inicio. */
export interface ModuloConfig {
  id: string;
  /** Ruta base, p. ej. "/proveedores". */
  ruta: string;
  titulo: string;
  descripcion: string;
  icono: LucideIcon;
  imagen: string;
  secciones: SeccionModulo[];
}
