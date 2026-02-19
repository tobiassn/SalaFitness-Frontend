import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import AppLayout from './AppLayout';
import './LocationsMap.css';

//reparare iconite default Leaflet in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

//componenta invizibila care muta camera hartii cand selectam o sala
function MapUpdater({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (center && center[0] && center[1]) {
            map.flyTo(center, zoom, { animate: true, duration: 1.5 });
        }
    }, [center, zoom, map]);
    return null;
}

function LocationsMap({ onBackToDashboard, onLogout }) {
    const [gyms, setGyms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGym, setSelectedGym] = useState(null);
    const [error, setError] = useState('');

    //setez centru default de ex centrul romaniei daca nu este nicio sala
    const defaultCenter = [45.9432, 24.9668]; 
    const defaultZoom = 6;

    const fetchGyms = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:5001/api/gyms', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setGyms(data);
                //daca avem sali, o selectam automat pe prima ca sa centram harta pe ea
                if (data.length > 0) {
                    setSelectedGym(data[0]);
                }
            } else if (response.status === 401 || response.status === 403) {
                onLogout();
            } else {
                setError('Eroare la preluarea locatiilor.');
            }
        } catch (err) {
            setError('Eroare de conexiune cu serverul.');
        } finally {
            setLoading(false);
        }
    }, [onLogout]);

    useEffect(() => {
        fetchGyms();
    }, [fetchGyms]);

    const handleGymClick = (gym) => {
        setSelectedGym(gym);
    };

    return (
        <AppLayout>
            <div className="locations-wrapper">
                <div className="locations-header">
                    <h2>Locatiile Noastre</h2>
                    <button className="back-btn" onClick={onBackToDashboard}>⬅ Inapoi</button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="locations-split-container">
                    <div className="locations-list-pane">
                        {loading ? (
                            <p style={{ color: 'white', textAlign: 'center' }}>Se incarca locatiile...</p>
                        ) : gyms.length === 0 ? (
                            <p style={{ color: 'white', textAlign: 'center' }}>Nu exista sali inregistrate momentan.</p>
                        ) : (
                            gyms.map(gym => (
                                <div 
                                    key={gym.location_id} 
                                    className={`gym-list-card ${selectedGym?.location_id === gym.location_id ? 'active' : ''}`}
                                    onClick={() => handleGymClick(gym)}
                                >
                                    <h3>{gym.nume}</h3>
                                    <p className="gym-address">📍 {gym.adresa}</p>
                                    <p className="gym-desc">{gym.descriere}</p>

                                    <div className="gym-details-extra">
                                        {/* Orar */}
                                        {gym.opening_hours && Object.keys(gym.opening_hours).length > 0 && (
                                            <div className="hours-section">
                                                <span className="section-title">Orar:</span>
                                                {Object.entries(gym.opening_hours).map(([zi, ore]) => (
                                                    <div key={zi} className="hour-row">
                                                        <span>{zi}:</span> <strong>{ore}</strong>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {/* Facilitati */}
                                        {gym.facilities && gym.facilities.length > 0 && (
                                            <div className="facilities-section">
                                                <span className="section-title">Facilități:</span>
                                                <div className="tags-container">
                                                    {gym.facilities.map((fac, idx) => (
                                                        <span key={idx} className="map-facility-tag">{fac}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            ))
                        )}
                    </div>

                    <div className="locations-map-pane">
                        <MapContainer 
                            center={selectedGym ? [selectedGym.latitude, selectedGym.longitude] : defaultCenter} 
                            zoom={selectedGym ? 14 : defaultZoom} 
                            className="leaflet-map-container"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            
                            {/* actualizeaza camera cand se schimba selectedGym */}
                            {selectedGym && (
                                <MapUpdater center={[selectedGym.latitude, selectedGym.longitude]} zoom={15} />
                            )}

                            {/* randam cate un marker pentru fiecare sala din baza de date */}
                            {gyms.map(gym => {
                                if (!gym.latitude || !gym.longitude) return null; 

                                return (
                                    <Marker 
                                        key={gym.location_id} 
                                        position={[gym.latitude, gym.longitude]}
                                        eventHandlers={{
                                            click: () => handleGymClick(gym),
                                        }}
                                    >
                                        <Popup>
                                            <div className="map-popup-custom">
                                                <strong>{gym.nume}</strong>
                                                <div className="popup-address">📍 {gym.adresa}</div>
                                                
                                                {gym.opening_hours && Object.keys(gym.opening_hours).length > 0 && (
                                                    <div className="popup-hours">
                                                        {Object.entries(gym.opening_hours).map(([zi, ore]) => (
                                                            <div key={zi}><b>{zi}:</b> {ore}</div>
                                                        ))}
                                                    </div>
                                                )}

                                                {gym.facilities && gym.facilities.length > 0 && (
                                                    <div className="popup-facilities">
                                                        {gym.facilities.map((fac, idx) => (
                                                            <span key={idx} className="popup-tag">{fac}</span>
                                                        ))}
                                                    </div>
                                                )}

                                                <a 
                                                    href={`https://www.google.com/maps?q=${gym.latitude},${gym.longitude}`} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="popup-google-btn"
                                                >
                                                     Deschide in Google Maps
                                                </a>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}
                        </MapContainer>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

export default LocationsMap;