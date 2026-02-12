import { useState, useEffect } from 'react';
import "./App.css";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import FirstPage from "./components/FirstPage";
import AdminGymsManagement from "./components/AdminGymsManagement";

function App() {
  //stare pentru a tine minte ce pagina afisam ('login' sau 'register')
  const [currentView, setCurrentView] = useState('firstPage');

  //verific la incarcare daca userul e deja logat
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setCurrentView('dashboard');
    }
  }, []);

  const goToLogin = () => setCurrentView('login');
  const goToRegister = () => setCurrentView('register');
  const goToDashboard = () => setCurrentView('dashboard');
  const goToAdminGyms = () => setCurrentView('adminGyms');

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setCurrentView('firstPage');
  };

  return (
    <div>
      {currentView === 'firstPage' && (
        <FirstPage 
            onNavigateToLogin={goToLogin} 
            onNavigateToRegister={goToRegister} 
        />
      )}

      {currentView === 'login' && (
        <Login 
            onSwitchToRegister={goToRegister} 
            onLoginSuccess={goToDashboard} 
        />
      )}
      
      {currentView === 'register' && (
        <Register onSwitchToLogin={goToLogin} 
         />
      )}

      {currentView === 'dashboard' && (
        <Dashboard 
          onLogout={handleLogout} 
          onNavigateToAdminGyms={goToAdminGyms}
        />
      )}

      {currentView === 'adminGyms' && (
        <AdminGymsManagement 
          onBackToDashboard={goToDashboard}
          onLogout={handleLogout}
       />
      )}
    </div>
  );
};
export default App;
