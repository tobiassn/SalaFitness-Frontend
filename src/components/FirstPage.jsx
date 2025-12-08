import { useState, useEffect } from 'react';
import './FirstPage.css';

function FirstPage({onNavigateToLogin,onNavigateToRegister}){

    const [isMuted,setIsMuted] = useState(true);

    const toggleMute = () => {//ca sa pornesc/opresc sunetul
        setIsMuted(!isMuted);
    };


    return (
        
        <div className="firstpage-container">
            <video 
                className="firstpage-video"
                autoPlay 
                loop 
                muted={isMuted} 
                playsInline
                preload="auto"
            >
            <source src = "/videos/dashboardVideo.mp4" type="video/mp4"/>
            </video>
            <img 
                src="/Images/logo2.png"
                alt = "Logo-ul salii" 
                className="fp-top-left-logo" 
                onClick={() => window.location.reload()}
            /> 
             <div className='firstpage-nav'>
                    <button className="firstpage-login-btn" onClick={onNavigateToLogin}>
                        LOGIN
                    </button>
            </div>
            <div className="firstpage-center">
                <h1>BINE AI VENIT!</h1>
                <h2>Incepe transformarea ta astazi</h2>
                <button className="devino-membru-btn" onClick={onNavigateToRegister}>
                    DEVINO MEMBRU
                </button>
            </div>
            <button className="firstpage-mute-btn" onClick={toggleMute}>
                {isMuted ? "🔇" : "🔊"}
            </button>
        </div>

    );

};

export default FirstPage;

