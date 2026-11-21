import './EncabezadoPagina.css';

interface Props {
  modulo: string;
  titulo: string;
  descripcion: string;
}

/** Título de la pantalla actual, igual en todos los módulos. */
export default function EncabezadoPagina({ modulo, titulo, descripcion }: Props) {
  return (
    <header className="encabezado-pagina">
      <p className="encabezado-pagina__modulo">{modulo}</p>
      <h1 className="encabezado-pagina__titulo">{titulo}</h1>
      <p className="encabezado-pagina__descripcion">{descripcion}</p>
    </header>
  );
}
