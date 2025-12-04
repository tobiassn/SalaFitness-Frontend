import { useState } from 'react';
import "./App.css";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  //stare pentru a tine minte ce pagina afisam ('login' sau 'register')
  const [currentView, setCurrentView] = useState('login');

  //Functie pentru a schimba pagina
  const toggleView = () => {
    setCurrentView(currentView === 'login' ? 'register' : 'login');
  };

  return (
    <div>
      {currentView === 'login' ? (
        //Pasam functia toggleView ca sa o putem apela din butonul "Register"
        <Login onSwitchToRegister={toggleView} />
      ) : (
        <Register onSwitchToLogin={toggleView} />
      )}
    </div>
  );
};
export default App;
