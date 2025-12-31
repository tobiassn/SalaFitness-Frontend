import { useState, useEffect } from 'react';
import AuthLayout from './AuthLayout';
import './Login.css'

function Login({ onSwitchToRegister,onLoginSuccess }){

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
            const response = await fetch('http://localhost:5001/api/login',{
                method: 'POST',
                headers: {
                    'Content-Type':'application/json',
                },
                body: JSON.stringify({username,password}),
            });

            const data = await response.json();

            if(response.status === 200){
                console.log('Login reusit: ',data);
                //o sa folosesc localStorage pentru a stoca access token ul
                localStorage.setItem('accessToken',data.accessToken);//salvez pentru cereri viitoare
                localStorage.setItem('user',JSON.stringify(data.user));//salvez datele convertite in text ca sa stiu cine e logat

                if(onLoginSuccess){
                    onLoginSuccess();
                }

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
        <AuthLayout title = "Autentificare">
            <form onSubmit={handleSubmit}> 

                    {error && <div className="error-message">{error}</div>}
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
                     <button 
                        type="submit" 
                        className="login-btn" 
                        disabled={isLoading}>
                        {isLoading ? 'Se incarca...' : 'Login'}
                    </button>
                    <button 
                        type="button"
                        className="register-btn" 
                        onClick={onSwitchToRegister} 
                        disabled={isLoading}
                    >
                        Nu ai cont? Inregistreaza-te aici
                    </button>
                </div>
                </form>
        </AuthLayout>
    );

}

export default Login;