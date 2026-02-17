import { useState, useEffect, useCallback } from 'react'; //import la useCallBack
import { QRCodeCanvas } from 'qrcode.react';
import './Dashboard.css';
import AppLayout from './AppLayout';

function Dashboard({onLogout,onNavigateToSubscriptions}){
    const [user,setUser] = useState(null);
    const [showQR,setShowQR] = useState(false);
    const [logoutConfirm,setLogoutConfirm] = useState(false);

    const [activeTab, setActiveTab] = useState('home'); //'home' sau 'history'
    const [mySubs, setMySubs] = useState([]); //Lista de abonamente
    const [loadingSubs, setLoadingSubs] = useState(false);

    //folosesc autofetch care stie sa dea refresh singura
    const authFetch = useCallback(async (url, options = {}) => {
        let token = localStorage.getItem('accessToken');
        
        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        //cerere normala
        let response = await fetch(url, { ...options, headers });

        //token expirat
        if (response.status === 403 || response.status === 401) {
            console.log("Token expirat detectat in authFetch. Incerc refresh");

            try {
                //incerc refresh
                const refreshRes = await fetch('http://localhost:5001/api/refresh', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include' //trimit si refresh cookie ul
                });

                if (refreshRes.ok) {
                    const data = await refreshRes.json();
                    const newToken = data.accessToken;
                    
                    localStorage.setItem('accessToken', newToken);
                    console.log("Refresh reusit. Reincercam cererea initiala...");

                    //refac cererea cu noul token
                    const newHeaders = {
                        ...options.headers,
                        'Authorization': `Bearer ${newToken}`,
                        'Content-Type': 'application/json'
                    };
                    response = await fetch(url, { ...options, headers: newHeaders });

                } else {
                    //daca a expirat refresh token ul logout
                    console.error("Refresh token expirat.");
                    onLogout();
                    //returnez o eroare 
                    return Promise.reject("Session expired"); 
                }
            } catch (err) {
                console.error("Eroare retea la refresh.");
                onLogout();
                return Promise.reject(err);
            }
        }

        return response;
    }, [onLogout]);

    useEffect( () => {//iau informatiile despre user din localStorage, useEffect face asta o singura data datorita [] de la final
        const storedUser = localStorage.getItem('user');
        if(storedUser){
            setUser(JSON.parse(storedUser));
        }
    },[]);

    const fetchMyHistory = async () => {
        setLoadingSubs(true);
        try {
            //folosesc authFetch in loc de fetch simplu
            const response = await authFetch('http://localhost:5001/api/subscriptions/my-history', {
                method: 'GET'
            });

            //verific daca raspunsul e ok
            if (response && response.ok) {
                const data = await response.json();
                setMySubs(data);
            }
        } catch (err) {
            //ignor eroarea session expired ca e tratata in authFetch
            if (err !== "Session expired") {
                console.error("Eroare istoric:", err);
            }
        } finally {
            setLoadingSubs(false);
        }
    };

    //Handler cand apas pe butonul din meniu
    const handleSwitchToHistory = () => {
        setActiveTab('history');
        fetchMyHistory(); //Incarc datele cand intra pe tab
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ro-RO');
    };

    return(
        <AppLayout>
            <nav className="db-navigation-bar">
                <div className="db-navigation-buttons">
                    <button 
                        className={`db-nav-btn ${activeTab === 'home' ? 'active' : ''}`}
                        onClick={() => setActiveTab('home')}
                    >
                        Acasa
                    </button>

                    <button className="db-nav-btn">
                        Profilul meu
                    </button>

                    {getUserRole()==="Client" && (
                        <>
                            <button 
                                className={`db-nav-btn ${activeTab === 'history' ? 'active' : ''}`} 
                                onClick={handleSwitchToHistory} 
                            >
                                Abonamentele mele
                            </button>
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
                    <button className="db-nav-btn" onClick={onNavigateToSubscriptions}>Abonamente</button>
                </div>
            </nav>
            <div className="dashboard-center">
                
                {/*vedere home default*/}
                {activeTab === 'home' && (
                    <div className="home-view fade-in">
                        <h2>BINE AI VENIT!</h2>
                        <h1>{getDisplayName().toUpperCase()}</h1>
                        
                        <button className="db-access-card-btn" onClick={handleOpenQR}>
                            Card Acces
                        </button>
                    </div>
                )}

                {/*istoric abonamente*/}
                {activeTab === 'history' && (
                    <div className="history-view fade-in">
                        <h2>Istoricul Tau</h2>
                        
                        {loadingSubs ? (
                            <p>Se incarca...</p>
                        ) : mySubs.length === 0 ? (
                            <div className="empty-state">
                                <p>Nu ai niciun abonament inca.</p>
                                <button onClick={onNavigateToSubscriptions} className="mini-cta-btn">
                                    Cumpara primul abonament
                                </button>
                            </div>
                        ) : (
                            <div className="history-table-container">
                                <table className="history-table">
                                    <thead>
                                        <tr>
                                            <th>Abonament</th>
                                            <th>Perioada</th>
                                            <th>Pret</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mySubs.map((sub) => (
                                            <tr key={sub.membership_id}>
                                                <td className="plan-name">{sub.name}</td>
                                                <td>{formatDate(sub.start_date)} - {formatDate(sub.end_date)}</td>
                                                <td>{sub.price_paid} RON</td>
                                                <td>
                                                    <span className={`status-badge ${sub.status}`}>
                                                        {sub.status === 'active' ? 'Activ' : 'Expirat'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
                
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
    </AppLayout>
    );

};

export default Dashboard;