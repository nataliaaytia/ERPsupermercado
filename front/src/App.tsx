import { useState } from 'react';
import { ThemeProvider } from './ThemeContext';
import Cabecera from './Cabecera';
import Home from './Home';
import Catalogo from './catalogo/Catalogo';
import Login from './Login';

export const App = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentPage('home');
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
          onNavigate={setCurrentPage}
          isLoggedIn={isLoggedIn}
        />
        <main className="app-main-content">
          {currentPage === 'home' && (
            <Home onNavigateToCatalogo={() => setCurrentPage('catalogo')} />
          )}
          {currentPage === 'catalogo' && <Catalogo />}
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
