import type { ReactNode } from 'react';
import SiguientePaso from '../../componentes/ui/SiguientePaso';
import { useProveedores } from './hooks/useProveedores';
import type { Proveedor } from './tipos';
import AsociarCatalogo from './paginas/AsociarCatalogo';
import { ComparacionProductos } from './paginas/ComparacionProductos';
import GestionProveedores from './paginas/GestionProveedores';
import RankingProveedores from './paginas/RankingProveedores';
import ReportesProveedores from './paginas/ReportesProveedores';
import VerCatalogo from './paginas/VerCatalogo';
import './proveedores.css';

/** Contenedor con las clases de estilo propias del módulo. */
function Contenedor({ children }: { children: ReactNode }) {
  return <div className="catalogo-container">{children}</div>;
}

/** Guía para dejar listo a un proveedor y continuar con el proceso de compra. */
function PasoProveedor({ proveedor }: { proveedor?: Proveedor }) {
  // Mientras no esté activo, el propio panel de estado (arriba) es el siguiente paso.
  if (!proveedor || proveedor.estado !== 'Activo') return null;
  if (proveedor.catalogoProductos.length === 0) {
    return (
      <SiguientePaso
        texto={`${proveedor.razonSocial} todavía no tiene productos en su catálogo.`}
        a="/proveedores/asociar-catalogo"
        etiqueta="Asociar catálogo"
      />
    );
  }
  return (
    <SiguientePaso
      texto="El proveedor está activo y con catálogo. Registra una requisición con los productos que necesitas."
      a="/requisiciones/nueva"
      etiqueta="Nueva requisición"
    />
  );
}

export function PaginaGestion() {
  const p = useProveedores();
  return (
    <Contenedor>
      <GestionProveedores
        proveedores={p.proveedores}
        proveedorSeleccionado={p.proveedorSeleccionado}
        onSeleccionar={p.setIdSeleccionado}
        cambiarEstadoProveedor={p.cambiarEstado}
        onRegistrarDocumento={p.registrarDocumento}
        onRegistrarProveedor={p.registrarProveedor}
      />
      <PasoProveedor proveedor={p.proveedorSeleccionado} />
    </Contenedor>
  );
}

export function PaginaAsociar() {
  const { proveedores, asociar } = useProveedores();
  return (
    <Contenedor>
      <AsociarCatalogo proveedores={proveedores} onAsociarProductos={asociar} />
      <SiguientePaso
        texto="Con el catálogo asociado, registra una requisición con los productos que necesitas reponer."
        a="/requisiciones/nueva"
        etiqueta="Nueva requisición"
      />
    </Contenedor>
  );
}

export function PaginaCatalogo() {
  const p = useProveedores();
  return (
    <Contenedor>
      <VerCatalogo
        proveedores={p.proveedores}
        proveedorSeleccionado={p.proveedorSeleccionado}
        onSeleccionar={p.setIdSeleccionado}
      />
    </Contenedor>
  );
}

export function PaginaComparacion() {
  const { proveedores } = useProveedores();
  return (
    <Contenedor>
      <ComparacionProductos proveedores={proveedores} />
    </Contenedor>
  );
}

export function PaginaRanking() {
  const { proveedores } = useProveedores();
  return (
    <Contenedor>
      <RankingProveedores proveedores={proveedores} />
    </Contenedor>
  );
}

export function PaginaReportes() {
  const { proveedores } = useProveedores();
  return (
    <Contenedor>
      <ReportesProveedores proveedores={proveedores} />
    </Contenedor>
  );
}

