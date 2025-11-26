import { useState } from 'react';
import './Login.css'

function Login(){

    const [username, setUsername] = useState(''); 
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();//opresc reincarcarea paginii pentru a putea salva datele
        console.log("Date de logare (Test):",username,password);//scriu in consola browserului pentru a testa
        //aici o sa vina functia care trimite datele catre un api de backend pt autentificare
        //onSubmit este asociat cu un buton de tip submit care face ca atunci cand se apasa login se apeleza functia handleSubmit pentru a prelua datele dupa ce e.prevent opreste reincarcarea paginii
    };

    return (
        
        <div className="login-container">
            <img 
                src="/Images/logo2.png"
                alt = "Logo-ul salii" 
                className="top-left-logo" 
            /> 
            <div className="welcome-message">
                WELCOME!
            </div>
            <div className="login-card">
                <h2>Autentificare</h2>

                <form onSubmit={handleSubmit}> 

                    <div className="form-group">
                        <label>Username:</label>
                        <input
                            type = "text"
                            placeholder="Introduceti username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                            <input
                                type="password"
                                placeholder = "Introduceti parola"
                                value = {password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                    </div>
                    <div className="button-group">
                        <button type="submit" className="login-btn">
                            Login
                        </button>
                        <button type="button" className="register-btn">
                            Register
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );

}

export default Login;