import SiguientePaso from '../../componentes/ui/SiguientePaso';
import { useCompras } from '../../estado/useCompras';
import RegistrarFactura from './paginas/RegistrarFactura';
import './facturacion.css';

export function PaginaRegistrar() {
  const { facturas } = useCompras();
  return (
    <>
      <RegistrarFactura />
      {facturas.some((factura) => factura.estado === 'Registrada') && (
        <SiguientePaso
          texto="Hay facturas registradas que aún no pasaron la validación de tres vías."
          a="/facturacion/validacion"
          etiqueta="Validar facturas"
        />
      )}
    </>
  );
}

