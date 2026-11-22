import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Los estilos globales van primero para que los de cada módulo puedan sobrescribirlos.
import './estilos/base.css';
import App from './app/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
