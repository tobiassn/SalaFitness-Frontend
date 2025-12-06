import { useState, useEffect } from 'react';
import "./App.css";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";

function App() {
  //stare pentru a tine minte ce pagina afisam ('login' sau 'register')
  const [currentView, setCurrentView] = useState('login');

  //Functie pentru a schimba pagina
  const toggleView = () => {
    setCurrentView(currentView === 'login' ? 'register' : 'login');
  };

  //verific la incarcare daca userul e deja logat
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setCurrentView('dashboard');
    }
  }, []);

  const handleLoginSuccess = () => {
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setCurrentView('login');
  };

  return (
    <div>
      {currentView === 'login' && (
        <Login 
            onSwitchToRegister={toggleView} 
            onLoginSuccess={handleLoginSuccess} 
        />
      )}
      
      {currentView === 'register' && (
        <Register onSwitchToLogin={toggleView} />
      )}

      {currentView === 'dashboard' && (
        <Dashboard onLogout={handleLogout} />
      )}
    </div>
  );
};
export default App;
