
import { useState } from 'react';
import { ThemeProvider } from './ThemeContext';
import Cabecera from './Cabecera';
import Home from './Home';
import Catalogo from './catalogo/Catalogo';
import Login from './Login';
import Requisiciones from './requisicionesCotizaciones/Requisiciones';

const paginasValidas = [
  'home',
  'catalogo',
  'requisiciones',
  'login',
];

export const App = () => {
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const paginaGuardada = sessionStorage.getItem('currentPage');

    return paginaGuardada && paginasValidas.includes(paginaGuardada)
      ? paginaGuardada
      : 'home';
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const navegar = (pagina: string) => {
    setCurrentPage(pagina);
    sessionStorage.setItem('currentPage', pagina);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    navegar('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
  };

  return (
    <ThemeProvider>
      <div className="app-container">
        <Cabecera
          currentPage={currentPage}
          onNavigate={navegar}
          isLoggedIn={isLoggedIn}
        />

        <main className="app-main-content">
          {currentPage === 'home' && (
            <Home
              onNavigateToCatalogo={() => navegar('catalogo')}
            />
          )}

          {currentPage === 'catalogo' && <Catalogo />}

          {currentPage === 'requisiciones' && <Requisiciones />}

          {currentPage === 'login' && (
            <Login
              isLoggedIn={isLoggedIn}
              onSuccess={handleLoginSuccess}
              onLogout={handleLogout}
            />
          )}
        </main>
      </div>
    </ThemeProvider>
  );
};

export default App;
