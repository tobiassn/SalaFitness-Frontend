import { useState, useEffect, useCallback } from 'react'; 
import { QRCodeCanvas } from 'qrcode.react';
import './Dashboard.css';
import AppLayout from './AppLayout';

function Dashboard({onLogout, onNavigateToProfile, onNavigateToAdminGyms, onNavigateToSubscriptions, onNavigateToTrainers, onNavigateToAppointments,onNavigateToAdminUsers,onNavigateToLocationsMap,onNavigateToAdminPlans}){
    const [user, setUser] = useState(null);
    const [showQR, setShowQR] = useState(false);
    const [logoutConfirm, setLogoutConfirm] = useState(false);

    const [activeTab, setActiveTab] = useState('home'); 
    const [mySubs, setMySubs] = useState([]); 
    const [loadingSubs, setLoadingSubs] = useState(false);

    const authFetch = useCallback(async (url, options = {}) => {
        let token = localStorage.getItem('accessToken');
        
        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        let response = await fetch(url, { ...options, headers });

        if (response.status === 403 || response.status === 401) {
            console.log("Token expirat detectat in authFetch. Incerc refresh");

            try {
                const refreshRes = await fetch('http://localhost:5001/api/refresh', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include' 
                });

                if (refreshRes.ok) {
                    const data = await refreshRes.json();
                    const newToken = data.accessToken;
                    
                    localStorage.setItem('accessToken', newToken);
                    
                    const newHeaders = {
                        ...options.headers,
                        'Authorization': `Bearer ${newToken}`,
                        'Content-Type': 'application/json'
                    };
                    response = await fetch(url, { ...options, headers: newHeaders });

                } else {
                    onLogout();
                    return Promise.reject("Session expired"); 
                }
            } catch (err) {
                onLogout();
                return Promise.reject(err);
            }
        }

        return response;
    }, [onLogout]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if(storedUser){
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const fetchMyHistory = async () => {
        setLoadingSubs(true);
        try {
            const response = await authFetch('http://localhost:5001/api/subscriptions/my-history', {
                method: 'GET'
            });

            if (response && response.ok) {
                const data = await response.json();
                setMySubs(data);
            }
        } catch (err) {
            if (err !== "Session expired") {
                console.error("Eroare istoric:", err);
            }
        } finally {
            setLoadingSubs(false);
        }
    };

    const handleSwitchToHistory = () => {
        setActiveTab('history');
        fetchMyHistory(); 
    };

    const handleOpenQR = () => setShowQR(true);
    const handleCloseQR = () => setShowQR(false);

    const getUserRole = () => user?.rol || 'Client';

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
                    <button className="db-nav-btn" onClick={onNavigateToLocationsMap}>Locatii Sali</button>
                    <button className="db-nav-btn" onClick={onNavigateToProfile}>
                        Profilul meu
                    </button>

                    {getUserRole() === "Client" && (
                        <>
                            <button 
                                className={`db-nav-btn ${activeTab === 'history' ? 'active' : ''}`} 
                                onClick={handleSwitchToHistory} 
                            >
                                Abonamentele mele
                            </button>
                            <button className="db-nav-btn" onClick={onNavigateToTrainers}>
                                Antrenorii nostri
                            </button>
                            <button className="db-nav-btn" onClick={onNavigateToAppointments}>
                                Programarile mele
                            </button>
                        </>
                    )}
                    
                    {getUserRole() === "Trainer" && (
                        <button className="db-nav-btn" onClick={onNavigateToAppointments}>
                            Programarile mele
                        </button>
                    )}
                    
                    {getUserRole() === "Admin" && (
                        <>
                            <button className="db-nav-btn" onClick={onNavigateToAdminUsers}>Utilizatori</button>
                            <button className="db-nav-btn" onClick={onNavigateToAdminGyms}>Administrare Sali</button>
                            <button className="db-nav-btn" onClick={onNavigateToAdminPlans}>Administrare Abonamente</button>
                        </>
                    )}
                    <button className="db-nav-btn" onClick={onNavigateToSubscriptions}>Abonamente</button>
                </div>
            </nav>

            <div className="dashboard-center">
                {activeTab === 'home' && (
                    <div className="home-view fade-in">
                        <h2>BINE AI VENIT!</h2>
                        <h1>{getDisplayName().toUpperCase()}</h1>
                        <button className="db-access-card-btn" onClick={handleOpenQR}>
                            Card Acces
                        </button>
                    </div>
                )}

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
                ➜
            </button>

            {logoutConfirm && (
                <div className="logout-content">
                    <p>Esti sigur ca vrei sa te deconectezi?</p>
                    <div className="logout-actions">
                        <button className="logout-content-btn" onClick={onLogout}>DA</button>
                        <button className="logout-content-btn" onClick={() => setLogoutConfirm(false)}>NU</button>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

export default Dashboard;