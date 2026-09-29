import { useState } from 'react';
import { ThemeProvider } from './ThemeContext';
import Cabecera from './Cabecera';
import Home from './Home';
import Catalogo from './Catalogo';
import Login from './Login';

export const App = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');

  return (
    <ThemeProvider>
      <div className="app-container">
        <Cabecera currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="app-main-content">
          {currentPage === 'home' && <Home />}
          {currentPage === 'catalogo' && <Catalogo />}
          {currentPage === 'login' && <Login onSuccess={() => setCurrentPage('home')} />}
        </main>
      </div>
    </ThemeProvider>
  );
};

export default App;