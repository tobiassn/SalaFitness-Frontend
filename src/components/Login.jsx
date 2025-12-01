import { useState } from 'react';
import './Login.css'

function Login(){

    const [username, setUsername] = useState(''); 
    const [password, setPassword] = useState('');

    //stochez mesajele de eroare pentru a le scrie si in interfata nu doar pentru alert
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

   const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try{
            const response = await fetch('http://localhost:5000/api/login',{
                method: 'POST',
                headers: {
                    'Content-Type':'application/json',
                },
                body: JSON.stringify({username,password}),
            });

            const data = await response.json();

            if(response.status === 200){
                console.log('Login reusit: ',data);
                alert(`Autentificare reusita! Bun venit, ${data.user.username} (Rol: ${data.user.rol})`);
            }
            else if(response.status === 400 || response.status === 429){
                setError(data.message);
            }
            else {
                setError('A aparut o eroare neasteptata. Status : ' + response.status);
            }
        }
        catch(error){
            //esec de retea, docker sau nodejs oprit
            console.error("Eroare de rețea:", error);
            setError('Nu am putut contacta serverul. Asigura-te ca Backend-ul ruleaza.');
        } finally {
            setIsLoading(false); 
        }
        
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