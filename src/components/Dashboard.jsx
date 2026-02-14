import { useState, useEffect } from 'react';
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

    useEffect( () => {//iau informatiile despre user din localStorage, useEffect face asta o singura data datorita [] de la final
        const storedUser = localStorage.getItem('user');
        if(storedUser){
            setUser(JSON.parse(storedUser));
        }
    },[]);

    const fetchMyHistory = async () => {
        setLoadingSubs(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:5001/api/subscriptions/my-history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setMySubs(data);
            }
        } catch (err) {
            console.error("Eroare istoric:", err);
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