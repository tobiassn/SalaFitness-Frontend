import {useState} from 'react';
import './Register.css'


function Register({ onSwitchToLogin,pressLogo }){//primesc o functie ca sa ma pot intoarce la login

    const [username,setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); //Doar pentru frontend
    const [nume, setNume] = useState('');
    const [prenume, setPrenume] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMuted,setIsMuted] = useState(true);

    const toggleMute = () => {//ca sa pornesc/opresc sunetul
        setIsMuted(!isMuted);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        if(password != confirmPassword){
            setError('Parolele nu coincid!');
            setIsLoading(false);
            console.error('Parolele nu coincid');
            return;
        }

        try{
            const response = await fetch('http://localhost:5001/api/register',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({username,password,nume,prenume}),
            });

            const data = await response.json();

            if(response.status===201){
                setSuccess('Cont creat cu succes! Te poti loga acum.');
                setUsername('');
                setNume('');
                setPrenume('');
                setPassword('');
                setConfirmPassword('');
                alert(`Cont creat cu succes! Te poti loga acum.`);
                if (onSwitchToLogin) {
                    onSwitchToLogin();
                }
            }
            else if(response.status===400 || response.status===409){
                setError(data.message);
                console.error('Acest username este deja folosit sau parola nu contine minim 1 litera si 1 cifra!');
            }
            else{
                setError('Eroare server: ' + response.status);
            }
        }catch(err){
                console.error(err);
                setError('Nu am putut contacta serverul.');
        }
        finally{
            setIsLoading(false);
        }
    };

    return (

         <div className="register-container">
            <video 
                className="rp-video"
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
                className="register-top-left-logo" 
                onClick={pressLogo}
            /> 
            <div className="register-card">
                <h2>Inregistrare</h2>

                {error && <div className="register-error-message">{error}</div>}
                {success && <div className="register-success-message">{success}</div>}

                <form onSubmit={handleSubmit}> 

                    <div className="register-form-group">
                        <label>Username:</label>
                        <input
                            type = "text"
                            placeholder="Introduceti username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="register-form-row">
                        <div className="register-form-group">
                         <label>Nume:</label>
                               <input
                                    type="text"
                                    placeholder = "Introduceti numele"
                                    value = {nume}
                                    onChange={(e) => setNume(e.target.value)}
                                    required
                                />
                        </div>
                        <div className="register-form-group">
                            <label>Prenume:</label>
                                <input
                                    type="text"
                                    placeholder = "Introduceti prenumele"
                                    value = {prenume}
                                    onChange={(e) => setPrenume(e.target.value)}
                                    required
                                />
                        </div>
                    </div>
                    <div className="register-form-group">
                        <label>Parola:</label>
                            <input
                                type="password"
                                placeholder = "Introduceti parola"
                                value = {password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                    </div>
                    <div className="register-form-group">
                        <label>Confirma Parola:</label>
                            <input
                                type="password"
                                placeholder = "Confirmati parola"
                                value = {confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                    </div>
                        <button type="submit" className="create-account-btn" disabled={isLoading}>
                                {isLoading ? 'Se proceseaza...' : 'Creeaza Cont'}
                        </button>
                 </form>
                        <button className="register-switch-btn" onClick={onSwitchToLogin}>
                            Ai deja cont? Logheaza-te aici
                        </button>
            </div>
            <button className="mute-btn-rp" onClick={toggleMute}>
                {isMuted ? "🔇" : "🔊"}
            </button>
        </div>
    );

};

export default Register;