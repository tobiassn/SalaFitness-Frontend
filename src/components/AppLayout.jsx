import {useState} from 'react';
import './AppLayout.css'

const AppLayout = ({children}) => {

    const [isMuted,setIsMuted] = useState(true);

    const toggleMute = () => {//ca sa pornesc/opresc sunetul
        setIsMuted(!isMuted);
    };

    return(
        <div className = "app-container">
            <video 
                className="app-video"
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
            {children}
            <button className="mute-btn" onClick={toggleMute}>
                {isMuted ? "🔇" : "🔊"}
            </button>
        </div>
    );
    
};

export default AppLayout;