import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import './Dashboard.css';

function Dashboard({onLogout}){
    const [user,setUser] = useState(null);
    const [isMuted,setIsMuted] = useState(true);
    const [showQR,setShowQR] = useState(false);
    const [logoutConfirm,setLogoutConfirm] = useState(false);

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

    const getDisplayName = () => {
        if (user?.prenume && user.prenume !== '-') {
            return user.prenume;
        }
        return 'ESTI ' + getUserRole();
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
                className="db-top-left-logo" 
                onClick={() => window.location.reload()}
            /> 
            <nav className="db-navigation-bar">
                <div className="db-navigation-buttons">
                    <button className="db-nav-btn">
                        Acasa
                    </button>
                    <button className="db-nav-btn">
                        Profilul meu
                    </button>
                    {getUserRole()==="Client" && (//butoane client
                        <>
                            <button className="db-nav-btn">Abonamentele mele</button>
                            <button className="db-nav-btn">Antrenorii nostri</button>
                            <button className="db-nav-btn">Programarile mele</button>
                        </>
                    )}
                    {getUserRole()==="Trainer" &&(
                        <>
                            <button className="db-nav-btn">Programarile mele</button>
                        </>
                    )}
                    {getUserRole()==="Admin" &&(
                        <>
                            <button className="db-nav-btn">Utilizatori</button>
                        </>
                    )}
                    <button className="db-nav-btn">Abonamente</button>
                </div>
            </nav>
            <div className="dashboard-center">
                <h2>BINE AI VENIT!</h2>
                <h1>{getDisplayName().toUpperCase()}</h1>
                
                <button className="db-access-card-btn" onClick={handleOpenQR}>
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
            <button className="db-mute-btn" onClick={toggleMute}>
                {isMuted ? "🔇" : "🔊"}
            </button>
            <button className="db-logout-btn" onClick={() => setLogoutConfirm(true)}>
                ➜]
            </button>
            {logoutConfirm && (<div className="logout-content">
                <p>Esti sigur ca vrei sa te deconectezi?</p>
                <button className="logout-content-btn" onClick={onLogout}>
                    DA
                </button>
                <button className="logout-content-btn" onClick={() => setLogoutConfirm(false)}>
                    NU
                </button>
            </div>)}
        </div>
    );

};

export default Dashboard;