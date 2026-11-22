import { Link } from 'react-router-dom';

export default function NoEncontrado() {
  return (
    <section className="estado-vacio pagina-centrada">
      <h2>Página no encontrada</h2>
      <p>La dirección que buscas no existe.</p>
      <Link to="/">Volver al inicio</Link>
    </section>
  );
}
