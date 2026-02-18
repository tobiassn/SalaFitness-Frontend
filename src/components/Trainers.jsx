import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from './AppLayout';
import './Trainers.css';

const Trainers = ({ onBack }) => {
    const [locations, setLocations] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [view, setView] = useState('locations'); //'locations' sau 'trainers'
    const [selectedLoc, setSelectedLoc] = useState(null);
    const [loading, setLoading] = useState(true);

    //generez orele
    const timeSlots = [
        "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
        "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
    ];

    //functie pentru a verifica o ora
    const isOccupied = (slotTime, occupiedArray) => {
        return occupiedArray.some(occ => occ.startsWith(slotTime));
    };

    const [showModal, setShowModal] = useState(false);
    const [activeTrainer, setActiveTrainer] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); //azi implicit
    const [occupiedSlots, setOccupiedSlots] = useState([]);

    //cand apas programeaza te
    const handleOpenBooking = async (trainer) => {
        setActiveTrainer(trainer);
        setShowModal(true);
        fetchOccupied(trainer.user_id, selectedDate);
    };

    //iau orele ocupate
    const fetchOccupied = async (tId, date) => {
        try {
            const data = await authFetch(`http://localhost:5001/api/appointments/occupied?trainer_id=${tId}&date=${date}`);
            setOccupiedSlots(data);
        } catch (err) { 
            console.error("Eroare la ocupare:", err); 
        }
    };

    const handleConfirmBooking = async (time) => {
        if (window.confirm(`Confirmi programarea la ora ${time}?`)) {
            try {
                await authFetch('http://localhost:5001/api/appointments/book', {
                    method: 'POST',
                    body: JSON.stringify({
                        trainer_id: activeTrainer.user_id,
                        location_id: selectedLoc.location_id,
                        date: selectedDate,
                        time: time
                    })
                });
                
                alert("✅ Programare reusita!");
                setShowModal(false);
                //actualizez sloturi
                fetchOccupied(activeTrainer.user_id, selectedDate);
                
            } catch (err) { 
                console.log("Status eroare:", err.status);
                
                if (err.status === 409) {
                    //programare activa sau interval orar deja ocupat
                    alert("⚠️ " + err.message); 
                } 
                else if (err.status === 403) {
                    //nu exista abonament activ
                    alert("⛔ " + err.message);
                } 
                else {
                    alert("Eroare: " + (err.message || "Ceva nu a mers bine."));
                }
            }
        }
    };

    const authFetch = useCallback(async (url, options = {}) => {
        //token curent
        let token = localStorage.getItem('accessToken');
        
        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        let response = await fetch(url, { ...options, headers });

        //logica refresh token
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
                } else {
                    //dau logout mai jos
                }
            } catch (err) {
                console.error("Eroare la refresh token:", err);
            }
        }
        
        //nu ai abonament
        if (!response.ok) {
            try {
                const errorData = await response.json();
                
                const error = new Error(errorData.message || "Eroare la server");
                error.status = response.status; 
                
                throw error; 
            } catch (parseError) {
                if (parseError.status) throw parseError;

                const error = new Error("Eroare la preluarea datelor");
                error.status = response.status;
                throw error;
            }
        }

        return response.json();
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [locsData, trainersData] = await Promise.all([
                    authFetch('http://localhost:5001/api/gyms'), 
                    authFetch('http://localhost:5001/api/trainers')
                ]);
                setLocations(locsData);
                setTrainers(trainersData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [authFetch]);

    const handleSelectLocation = (loc) => {
        setSelectedLoc(loc);
        setView('trainers');
    };

    const handleGoBack = () => {
        if (view === 'trainers') {
            setView('locations');
            setSelectedLoc(null);
        } else {
            onBack();
        }
    };

    //filtrez antrenorii pe baza locatiei selectate
    const filteredTrainers = trainers.filter(t => Number(t.location_id) == Number(selectedLoc?.location_id));
    if (loading) return <div className="loading-spinner">Se incarca salile...</div>;

    return (
    <AppLayout>
        <div className="trainers-page-content">
            <div className="trainers-page-header">
                <h2>{view === 'locations' ? 'Alege Locatia' : `Echipa din ${selectedLoc.nume}`}</h2>
                <button className="back-btn-trainers" onClick={handleGoBack}>
                    {view === 'trainers' ? '⬅ Schimba Locatia' : '⬅ Inapoi'}
                </button>
            </div>

            {view === 'locations' ? (
                <div className="locations-grid">
                    {locations.map(loc => (
                        <div key={loc.location_id} className="location-card" onClick={() => handleSelectLocation(loc)}>
                            <div className="loc-icon">🏢</div>
                            <h3>{loc.nume}</h3>
                            <p className="loc-address">📍 {loc.adresa || 'Adresa indisponibila'}</p>
                            <p className="loc-desc">{loc.descriere}</p>
                            <button className="view-trainers-btn">Vezi Antrenorii</button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="trainers-grid">
                    {filteredTrainers.length > 0 ? (
                        filteredTrainers.map(trainer => (
                            <div key={trainer.user_id} className="trainer-card">
                                <div className="trainer-header">
                                    <div className="trainer-avatar-placeholder">
                                        {trainer.nume[0]}{trainer.prenume[0]}
                                    </div>
                                    <h3>{trainer.nume} {trainer.prenume}</h3>
                                    <span className="trainer-specialization">{trainer.specializare}</span>
                                </div>
                                <div className="trainer-body">
                                    <p className="trainer-desc">{trainer.descriere}</p>
                                    <button 
                                        className="appointment-btn" 
                                        onClick={() => handleOpenBooking(trainer)}>
                                            Programeaza-te
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-trainers">
                            <p>Momentan nu avem antrenori alocati acestei locatii.</p>
                        </div>
                    )}
                </div>
            )}

            {showModal && activeTrainer && (
                <div className="modal-overlay-booking" onClick={() => setShowModal(false)}>
                    <div className="modal-booking-content" onClick={e => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={() => setShowModal(false)}>X</button>
                        
                        <h3>Programeaza-te cu {activeTrainer.prenume} {activeTrainer.nume}</h3>
                        <p className="modal-loc-info">📍 Locatie: {selectedLoc?.nume}</p>
                        
                        <div className="date-picker-container">
                            <label>Alege data:</label>
                            <input 
                                type="date" 
                                value={selectedDate} 
                                min={new Date().toISOString().split('T')[0]} 
                                onChange={(e) => {
                                    setSelectedDate(e.target.value);
                                    fetchOccupied(activeTrainer.user_id, e.target.value);
                                }} 
                            />
                        </div>

                        <div className="slots-grid">
                            {timeSlots.map(slot => {
                                const busy = isOccupied(slot, occupiedSlots);
                                
                                const today = new Date();
                                const isToday = selectedDate === today.toISOString().split('T')[0];
                                const currentHour = today.getHours();
                                const slotHour = parseInt(slot.split(':')[0], 10);
                                
                                const isPast = isToday && slotHour <= currentHour;

                                let btnClass = 'available';
                                let btnText = 'Liber';
                                
                                if (busy) {
                                    btnClass = 'occupied';
                                    btnText = 'Ocupat';
                                } else if (isPast) {
                                    btnClass = 'unavailable'; 
                                    btnText = 'Indisponibil';
                                }
                                return (
                                    <button 
                                        key={slot}
                                        disabled={busy || isPast}
                                        className={`slot-btn ${btnClass}`}
                                        onClick={() => handleConfirmBooking(slot)}
                                    >
                                        {slot}
                                        <span className="slot-status">{btnText}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <p className="helper-text">Orele marcate cu rosu sunt rezervate. Cele gri au trecut deja.</p>
                    </div>
                </div>
            )}
        </div>
    </AppLayout>
);
};

export default Trainers;