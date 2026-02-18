import { useState, useEffect, useCallback } from 'react'; //import la useCallBack
import AppLayout from './AppLayout';
import './Profile.css';

function Profile({ onBackToDashboard, onLogout }) {
    const [formData, setFormData] = useState({
        nume: '',
        prenume: '',
        username: '',
        specializare: '',
        descriere: ''
    });

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    const [role, setRole] = useState('Client');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);

    
    //folosesc autofetch care stie sa dea refresh singura o folosesc la useEffect si la handleSubmit
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
                    console.log("Refresh reușit. Reîncercăm cererea inițială...");

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
                console.error("Eroare rețea la refresh.");
                onLogout();
                return Promise.reject(err);
            }
        }

        return response;
    }, [onLogout]);

    //incarc datele cu autofetch
    useEffect(() => {
        const fetchProfile = async () => {
            const userData = localStorage.getItem('user');
            if (!userData) return;

            try {
                const userObj = JSON.parse(userData);
                setRole(userObj.rol);

                const response = await authFetch('http://localhost:5001/api/profile', {
                    method: 'GET'
                });

                if (response && response.ok) {
                    const data = await response.json();
                    setFormData({
                        username: data.username || '',
                        nume: data.nume || '',
                        prenume: data.prenume || '',
                        specializare: data.specializare || '',
                        descriere: data.descriere || ''
                    });
                } else {
                    //Nu mai afisez eroare daca sesiunea a expirat (se ocupa authFetch de logout)
                    if (response) {
                        setMessage({ text: 'Nu s-au putut incarca datele.', type: 'error' });
                    }
                }
            } catch (err) {
                if (err !== "Session expired") {
                    console.error("Eroare:", err);
                    setMessage({ text: 'Eroare conexiune server.', type: 'error' });
                }
            }
        };

        fetchProfile();
    }, [authFetch]); //autoFetch este dependenta

    //Handler pentru input-uri
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    //salvez date cu autofetch
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        setIsLoading(true);

        if (passwords.newPassword && passwords.newPassword !== passwords.confirmNewPassword) {
            setMessage({ text: 'Parolele noi nu coincid!', type: 'error' });
            setIsLoading(false);
            return;
        }

        const payload = {
            nume: formData.nume,
            prenume: formData.prenume,
            ...(passwords.newPassword ? { 
                currentPassword: passwords.currentPassword, 
                newPassword: passwords.newPassword 
            } : {}),
            ...(role === 'Trainer' ? {
                specializare: formData.specializare,
                descriere: formData.descriere
            } : {})
        };

        try {
            const response = await authFetch('http://localhost:5001/api/profile', {
                method: 'PATCH',
                body: JSON.stringify(payload)
            });

            if (response && response.ok) {
                setMessage({ text: 'Profil actualizat cu succes!', type: 'success' });
                setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
                
                const storedUser = JSON.parse(localStorage.getItem('user'));
                const updatedUser = { ...storedUser, nume: formData.nume, prenume: formData.prenume };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            } else if (response) {
                const data = await response.json();
                setMessage({ text: data.message || 'Eroare la actualizare.', type: 'error' });
            }

        } catch (err) {
            if (err !== "Session expired") {
                console.error(err);
                setMessage({ text: 'Eroare server.', type: 'error' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="profile-container">
                <div className="profile-card">
                    <h2>Profilul Meu</h2>

                    {message.text && (
                        <div className={message.type === 'error' ? 'error-message' : 'success-message'}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        
                        <div className="profile-section-title">Date Personale</div>
                        <div className="form-group">
                            <label>Username (nu se poate modifica):</label>
                            <input type="text" value={formData.username} className="profile-input" disabled style={{opacity: 0.7, cursor: 'not-allowed'}}/>
                        </div>
                        <div className="profile-row">
                            <div className="form-group">
                                <label>Nume:</label>
                                <input type="text" name="nume" value={formData.nume} onChange={handleChange} className="profile-input" required />
                            </div>
                            <div className="form-group">
                                <label>Prenume:</label>
                                <input type="text" name="prenume" value={formData.prenume} onChange={handleChange} className="profile-input" required />
                            </div>
                        </div>

                        {role === 'Trainer' && (
                            <>
                                <div className="profile-section-title">Informatii Antrenor</div>
                                <div className="form-group">
                                    <label>Specializare:</label>
                                    <input type="text" name="specializare" value={formData.specializare} onChange={handleChange} className="profile-input" />
                                </div>
                                <div className="form-group">
                                    <label>Descriere:</label>
                                    <textarea name="descriere" value={formData.descriere} onChange={handleChange} className="profile-input profile-textarea" />
                                </div>
                            </>
                        )}

                        <div className="profile-section-title">Schimbare Parola</div>
                        <p style={{fontSize: '0.8em', color: '#ccc', marginBottom: '10px'}}>Completeaza doar daca vrei sa schimbi parola.</p>
                        
                        <div className="form-group">
                            <label>Parola Noua:</label>
                            <input type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} className="profile-input" placeholder="Minim 6 caractere" />
                        </div>

                        {passwords.newPassword && (
                            <>
                                <div className="form-group">
                                    <label>Confirma Parola Noua:</label>
                                    <input type="password" name="confirmNewPassword" value={passwords.confirmNewPassword} onChange={handlePasswordChange} className="profile-input" />
                                </div>
                                <div className="form-group">
                                    <label style={{color: '#ffcccc'}}>Parola Curenta (Obligatoriu pentru confirmare):</label>
                                    <input type="password" name="currentPassword" value={passwords.currentPassword} onChange={handlePasswordChange} className="profile-input" required />
                                </div>
                            </>
                        )}

                        <div className="profile-actions">
                            <button type="button" className="back-btn" onClick={onBackToDashboard}>Inapoi</button>
                            <button type="submit" className="save-btn" disabled={isLoading}>{isLoading ? 'Se salveaza...' : 'Salveaza Modificari'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}

export default Profile;