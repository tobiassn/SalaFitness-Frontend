import { useState, useEffect } from 'react';
import "./App.css";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import FirstPage from "./components/FirstPage";
import Trainers from "./components/Trainers";
import MyAppointments from "./components/MyAppointments";
import Subscriptions from "./components/Subscriptions";
import AdminGymsManagement from "./components/AdminGymsManagement";
import Profile from "./components/Profile";

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
  const goToTrainers = () => setCurrentView('trainers');
  const goToAppointments = () => setCurrentView('appointments');
  const goToSubscriptions = () => setCurrentView('subscriptions');

  const handleBackFromSubscriptions = () => {
    const token = localStorage.getItem('accessToken');
      if (token) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('firstPage');
      }
  };
  const goToAdminGyms = () => setCurrentView('adminGyms');
  const goToProfile = () => setCurrentView('profile');

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
            onNavigateToSubscriptions={goToSubscriptions}
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
          onNavigateToTrainers={goToTrainers}
          onNavigateToAppointments={goToAppointments}
          onNavigateToSubscriptions={goToSubscriptions}
          onNavigateToAdminGyms={goToAdminGyms}
          onNavigateToProfile={goToProfile}  
        />
      )}
      {currentView === 'trainers' && (
        <Trainers 
            onBack={goToDashboard} 
        />
      )}
      {currentView === 'appointments' && ( 
        <MyAppointments onBack={goToDashboard} />
      )}
      {currentView === 'subscriptions' && (
        <Subscriptions 
          onBack={handleBackFromSubscriptions} 
          onNavigateToLogin={goToLogin} 
          /> 
      )}
      {currentView === 'profile' && (
        <Profile 
            onBackToDashboard={goToDashboard}
            onLogout={handleLogout}
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
