import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LayoutModulo from '../componentes/layout/LayoutModulo';
import LayoutPrincipal from '../componentes/layout/LayoutPrincipal';
import RutaProtegida from '../componentes/layout/RutaProtegida';
import { SesionProvider } from '../contexto/SesionContext';
import { TemaProvider } from '../contexto/TemaContext';
import Inicio from '../paginas/inicio/Inicio';
import Login from '../paginas/login/Login';
import NoEncontrado from '../paginas/NoEncontrado';
import { modulos } from './modulos';
import { cargarTodo } from '../servicios/sincronizacion';

export default function App() {
  // Con la conexión activa, los datos se leen de los microservicios al iniciar.
  useEffect(() => {
    void cargarTodo();
  }, []);

  return (
    <TemaProvider>
      <SesionProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<LayoutPrincipal />}>
              <Route index element={<Inicio />} />
              <Route path="login" element={<Login />} />

              {modulos.map((modulo) => (
                <Route
                  key={modulo.id}
                  path={`${modulo.ruta}/*`}
                  element={
                    <RutaProtegida>
                      <LayoutModulo modulo={modulo} />
                    </RutaProtegida>
                  }
                >
                  {modulo.secciones.map((seccion) => (
                    <Route key={seccion.ruta} path={seccion.ruta} element={seccion.elemento} />
                  ))}
                  <Route path="*" element={<NoEncontrado />} />
                </Route>
              ))}

              <Route path="*" element={<NoEncontrado />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SesionProvider>
    </TemaProvider>
  );
}
