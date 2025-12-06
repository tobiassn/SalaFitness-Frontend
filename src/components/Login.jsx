import { useState, useEffect } from 'react';
import './Login.css'

function Login({ onSwitchToRegister,onLoginSuccess }){

    const [username, setUsername] = useState(''); 
    const [password, setPassword] = useState('');

    //stochez mesajele de eroare pentru a le scrie si in interfata nu doar pentru alert
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMuted,setIsMuted] = useState(true);

    const toggleMute = () => {//ca sa pornesc/opresc sunetul
        setIsMuted(!isMuted);
    };

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
                localStorage.setItem('accesToken',data.accessToken);//salvez pentru cereri viitoare
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
        
        <div className="login-container">
            <video 
                className="lp-video"
                autoPlay 
                loop 
                muted={isMuted}
                playsInline
            >
                <source src="/videos/dashboardVideo.mp4" type="video/mp4"/>
            </video>
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
                        Register
                    </button>
                </div>

                </form>
            </div>
            <button className="mute-btn-lp" onClick={toggleMute}>
                {isMuted ? "🔇" : "🔊"}
            </button>
        </div>
    );

}

export default Login;