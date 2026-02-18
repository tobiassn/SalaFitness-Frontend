import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from './AppLayout';
import './MyAppointments.css';

const MyAppointments = ({ onBack }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('');

    //autofetch
    const authFetch = useCallback(async (url, options = {}) => {
        let token = localStorage.getItem('accessToken');
        
        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        let response = await fetch(url, { ...options, headers });

        //refresh token logic
        if (response.status === 401 || response.status === 403) {
            try {
                const refreshRes = await fetch('http://localhost:5001/api/refresh', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });

                if (refreshRes.ok) {
                    const data = await refreshRes.json();
                    localStorage.setItem('accessToken', data.accessToken);
                    const newHeaders = {
                        ...headers,
                        'Authorization': `Bearer ${data.accessToken}`
                    };
                    response = await fetch(url, { ...options, headers: newHeaders });
                }
            } catch (err) {
                console.error("Eroare refresh:", err);
            }
        }
        
        //error handling
        if (!response.ok) {
            try {
                const errorData = await response.json();
                const error = new Error(errorData.message || "Eroare server");
                error.status = response.status;
                throw error;
            } catch (parseError) {
                if (parseError.status) throw parseError;
                throw new Error("Eroare la preluarea datelor");
            }
        }

        return response.json();
    }, []);

    //fetch data
    const fetchData = useCallback(async () => {
        try {
            const data = await authFetch('http://localhost:5001/api/appointments/my-appointments');
            setAppointments(data);
        } catch (err) {
            console.error("Nu s-a putut incarca istoricul:", err);
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    //incarcare initiala
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) setUserRole(user.rol);
        
        fetchData();
    }, [fetchData]);

    //anulare programare
    const handleCancel = async (appId) => {
        if (window.confirm("Esti sigur ca vrei sa anulezi aceasta programare?")) {
            try {
                await authFetch(`http://localhost:5001/api/appointments/${appId}/cancel`, {
                    method: 'PUT'
                });
                alert("Programare anulata cu succes!");
                fetchData(); //reincarc lista pentru a actualiza statusul
            } catch (err) {
                alert("Eroare: " + err.message);
            }
        }
    };

    const upcoming = appointments.filter(a => 
        a.status === 'programat' || a.status === 'confirmat'
    );
    
    const history = appointments.filter(a => 
        a.status === 'finalizat' || a.status === 'anulat' || a.status === 'expirat'
    );

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('ro-RO', options);
    };

    const getPartnerName = (app) => {
        if (userRole === 'Trainer') {
            return `Client: ${app.client_prenume} ${app.client_nume}`;
        } else {
            return `Antrenor: ${app.trainer_prenume} ${app.trainer_nume}`;
        }
    };

    if (loading) return <div className="loading-spinner">Se incarca istoricul...</div>;

    return (
        <AppLayout>
            <div className="appointments-container">
                <div className="appointments-header">
                    <button className="back-btn" onClick={onBack}>⬅ Inapoi</button>
                    <h2>Programarile Mele</h2>
                </div>

                <div className="section-title">Urmeaza</div>
                <div className="appointments-list">
                    {upcoming.length > 0 ? (
                        upcoming.map(app => (
                            <div key={app.appointment_id} className="app-card active-card">
                                <div className="app-date">
                                    <span className="day">{formatDate(app.appointment_date)}</span>
                                    <span className="time">{app.start_time.slice(0, 5)}</span>
                                </div>
                                <div className="app-info">
                                    <h3>{getPartnerName(app)}</h3>
                                    <p>📍 {app.locatie}</p>
                                    <span className={`status-badge ${app.status}`}>{app.status.toUpperCase()}</span>
                                </div>
                                
                                <button 
                                    className="cancel-btn" 
                                    onClick={() => handleCancel(app.appointment_id)}
                                >
                                    ✕ Anuleaza
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="empty-msg">Nu ai nicio programare viitoare.</p>
                    )}
                </div>

                <div className="section-title">Istoric</div>
                <div className="appointments-list">
                    {history.length > 0 ? (
                        history.map(app => (
                            <div key={app.appointment_id} className="app-card history-card">
                                <div className="app-date">
                                    <span className="day">{formatDate(app.appointment_date)}</span>
                                    <span className="time">{app.start_time.slice(0, 5)}</span>
                                </div>
                                <div className="app-info">
                                    <h3>{getPartnerName(app)}</h3>
                                    <p>📍 {app.locatie}</p>
                                    <span className={`status-badge ${app.status}`}>{app.status.toUpperCase()}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="empty-msg">Istoricul este gol.</p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default MyAppointments;