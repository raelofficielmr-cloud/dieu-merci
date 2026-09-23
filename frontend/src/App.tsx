import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TauxProvider } from './context/TauxContext';
import { SuccursalesProvider } from './context/SuccursalesContext';

import Login from './pages/Login';
import MotDePasseOublie from './pages/MotDePasseOublie';
import Dashboard from './pages/Dashboard';
import Stock from './pages/Stock';
import StructurePrix from './pages/StructurePrix';
import SuiviCredit from './pages/SuiviCredit';
import Historique from './pages/Historique';
import Succursales from './pages/Succursales';
import ModeSombre from './pages/ModeSombre';
import Parametres from './pages/Parametres';

function RouteProtegee({ children }: { children: React.ReactNode }) {
  const { role, chargement } = useAuth();

  if (chargement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function RouteProtegeeProprietaire({ children }: { children: React.ReactNode }) {
  const { role, chargement } = useAuth();

  if (chargement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'Proprietaire') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<Login />} />
      <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />

      {/* Routes protégées */}
      <Route path="/" element={<RouteProtegee><Dashboard /></RouteProtegee>} />
      <Route path="/stock" element={<RouteProtegee><Stock /></RouteProtegee>} />
      <Route path="/structure-prix" element={<RouteProtegee><StructurePrix /></RouteProtegee>} />
      <Route path="/suivi-credit" element={<RouteProtegee><SuiviCredit /></RouteProtegee>} />
      <Route path="/historique" element={<RouteProtegee><Historique /></RouteProtegee>} />
      <Route path="/succursales" element={<RouteProtegee><Succursales /></RouteProtegee>} />
      <Route path="/mode-sombre" element={<RouteProtegee><ModeSombre /></RouteProtegee>} />
      <Route path="/parametres" element={<RouteProtegeeProprietaire><Parametres /></RouteProtegeeProprietaire>} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TauxProvider>
          <SuccursalesProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </SuccursalesProvider>
        </TauxProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;