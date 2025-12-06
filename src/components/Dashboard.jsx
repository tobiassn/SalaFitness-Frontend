import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import './Dashboard.css';

function Dashboard({onLogout}){
    const [user,setUser] = useState(null);
    const [isMuted,setIsMuted] = useState(true);
    const [showQR,setShowQR] = useState(false);

    useEffect( () => {//iau informatiile despre user din localStorage, useEffect face asta o singura data datorita [] de la final
        const storedUser = localStorage.getItem('user');
        if(storedUser){
            setUser(JSON.parse(storedUser));
        }
    },[]);

    const toggleMute = () => {//ca sa pornesc/opresc sunetul
        setIsMuted(!isMuted);
    };

    const handleOpenQR = () => setShowQR(true);
    const handleCloseQR = () => setShowQR(false);//functii pentru a porni/inchide qrcode

    const getUserRole = () => {
         return user?.rol || 'Client'; //? daca returneaza null nu crapa programul
    };

    return(
        <div className="dashboard-container">
            <video 
                className="dashboard-video"
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
                className="top-left-logo" 
            /> 
            <nav className="navigation-bar">
                <div className="navigation-buttons">
                    <button className="nav-btn">
                        Acasa
                    </button>
                    <button className="nav-btn">
                        Profilul meu
                    </button>
                    {getUserRole()==="Client" && (//butoane client
                        <>
                            <button className="nav-btn">Abonamentele mele</button>
                            <button className="nav-btn">Antrenorii nostri</button>
                            <button className="nav-btn">Programarile mele</button>
                        </>
                    )}
                    {getUserRole()==="Trainer" &&(
                        <>
                            <button className="nav-btn">Programarile mele</button>
                        </>
                    )}
                    {getUserRole()==="Admin" &&(
                        <>
                            <button className="nav-btn">Utilizatori</button>
                        </>
                    )}
                    <button className="nav-btn">Abonamente</button>
                </div>
            </nav>
            <div className="dashboard-center">
                <h2>BINE AI VENIT!</h2>
                <h1>{user?.prenume.toUpperCase()}</h1>
                
                <button className="access-card-btn" onClick={handleOpenQR}>
                    Card Acces
                </button>
                
                {showQR && (
                <div className="modal-overlay" onClick={handleCloseQR}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal" onClick={handleCloseQR}>X</button>
                        <h3>Cardul tau de acces</h3>
                        <div style={{background: 'white', padding: '10px', display: 'inline-block'}}>
                             <QRCodeCanvas value={user ? 'ID: ' + user.id.toString() : 'error'} size={200} />
                        </div>
                        <p>User: {user?.username}</p>
                    </div>
                </div>
            )}

            </div>
            <button className="mute-btn" onClick={toggleMute}>
                {isMuted ? "🔇" : "🔊"}
            </button>
        </div>
    );

};

export default Dashboard;