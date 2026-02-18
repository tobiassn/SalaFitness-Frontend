import { useState, useEffect, useCallback } from 'react';
import AppLayout from './AppLayout';
import './AdminGymsManagement.css';

function AdminGymsManagement({ onBackToDashboard, onLogout }) {
    //stare pentru lista de sali
    const [gyms, setGyms] = useState([]);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);
    
    //stare pentru editare vs creare
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    //stare pentru inputul temporar de facilitati
    const [facilityInput, setFacilityInput] = useState('');

    //stare formular
    const [formData, setFormData] = useState({
        nume: '',
        adresa: '',
        descriere: '',
        latitude: '',
        longitude: '',
        orarLuniVineri: '',
        orarSambataDuminica: '',
        facilities: [] //array de stringuri
    });

    //1.AuthFetch refolosibil pentru token management
    const authFetch = useCallback(async (url, options = {}) => {
        let token = localStorage.getItem('accessToken');
        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        let response = await fetch(url, { ...options, headers });

        //daca token expirat incerc refresh
        if (response.status === 403 || response.status === 401) {
            try {
                const refreshRes = await fetch('http://localhost:5001/api/refresh', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });

                if (refreshRes.ok) {
                    const data = await refreshRes.json();
                    localStorage.setItem('accessToken', data.accessToken);
                    
                    //refac cererea initiala
                    const newHeaders = {
                        ...options.headers,
                        'Authorization': `Bearer ${data.accessToken}`,
                        'Content-Type': 'application/json'
                    };
                    response = await fetch(url, { ...options, headers: newHeaders });
                } else {
                    onLogout(); //refresh esuat
                    return Promise.reject("Session expired");
                }
            } catch (err) {
                onLogout();
                return Promise.reject(err);
            }
        }
        return response;
    }, [onLogout]);

    //2.Incarcare lista sali
    const fetchGyms = useCallback(async () => {
        try {
            const response = await authFetch('http://localhost:5001/api/gyms');
            if (response.ok) {
                const data = await response.json();
                setGyms(data);
            }
        } catch (err) {
            console.error(err);
        }
    }, [authFetch]);

    useEffect(() => {
        fetchGyms();
    }, [fetchGyms]);

    //3.Logica formular
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    //logica pentru facilitati dinamice
    const handleAddFacility = (e) => {
        e.preventDefault(); //sa nu dea submit la form
        if(!facilityInput.trim()) return;

        //adaug doar daca nu exista deja
        if(!formData.facilities.includes(facilityInput.trim())){
            setFormData({
                ...formData,
                facilities: [...formData.facilities, facilityInput.trim()]
            });
        }
        setFacilityInput(''); //golesc inputul
    };

    const handleRemoveFacility = (facilityToRemove) => {
        setFormData({
            ...formData,
            facilities: formData.facilities.filter(f => f !== facilityToRemove)
        });
    };

    //logica editare
    const handleEdit = (gym) => {
        setIsEditing(true);
        setCurrentId(gym.location_id);
        setFormData({
            nume: gym.nume,
            adresa: gym.adresa || '',
            descriere: gym.descriere || '',
            latitude: gym.latitude,
            longitude: gym.longitude,
            orarLuniVineri: gym.opening_hours?.['Luni-Vineri'] || '',
            orarSambataDuminica: gym.opening_hours?.['Sambata-Duminica'] || '',
            facilities: gym.facilities || []
        });
        setMessage({ text: '', type: '' });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setCurrentId(null);
        setFormData({
            nume: '', adresa: '', descriere: '', latitude: '', longitude: '',
            orarLuniVineri: '', orarSambataDuminica: '', facilities: []
        });
        setMessage({ text: '', type: '' });
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Esti sigur ca vrei sa stergi aceasta sala?")) return;
        try {
            const response = await authFetch(`http://localhost:5001/api/gyms/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setMessage({ text: 'Sala stearsa cu succes!', type: 'success' });
                fetchGyms();
            }
        } catch (err) {
            setMessage({ text: 'Eroare la stergere.', type: 'error' });
        }
    };

    //4.Salvare date
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const payload = {
            nume: formData.nume,
            adresa: formData.adresa,
            descriere: formData.descriere,
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
            facilities: formData.facilities,
            opening_hours: {
                "Luni-Vineri": formData.orarLuniVineri,
                "Sambata-Duminica": formData.orarSambataDuminica
            }
        };

        try {
            const url = isEditing 
                ? `http://localhost:5001/api/gyms/${currentId}`
                : `http://localhost:5001/api/gyms`;
            
            const method = isEditing ? 'PATCH' : 'POST';

            const response = await authFetch(url, {
                method: method,
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setMessage({ text: isEditing ? 'Sala actualizata!' : 'Sala creata!', type: 'success' });
                fetchGyms();
                handleCancel();
            } else {
                const errData = await response.json();
                setMessage({ text: errData.message || 'Eroare.', type: 'error' });
            }
        } catch (err) {
            console.error(err);
            setMessage({ text: 'Eroare server.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="gym-management-container">
                
                {/*SECITUNE FORMULAR*/}
                <div className="gym-form-section">
                    <h2>{isEditing ? 'Editeaza Sala' : 'Adauga Sala Noua'}</h2>
                    {message.text && (
                        <div style={{
                            padding:'10px', 
                            marginBottom:'15px', 
                            borderRadius:'5px',
                            backgroundColor: message.type==='error'?'#ffebee':'#e8f5e9',
                            color: message.type==='error'?'#c62828':'#2e7d32'
                        }}>
                            {message.text}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="gym-form-group">
                            <label>Nume Sala:</label>
                            <input type="text" name="nume" value={formData.nume} onChange={handleChange} className="gym-input" required />
                        </div>
                        <div className="gym-form-group">
                            <label>Adresa:</label>
                            <input type="text" name="adresa" value={formData.adresa} onChange={handleChange} className="gym-input" required />
                        </div>
                        <div className="gym-form-group">
                            <label>Descriere:</label>
                            <textarea name="descriere" value={formData.descriere} onChange={handleChange} className="gym-input gym-textarea" />
                        </div>
                        
                        <div style={{display:'flex', gap:'15px'}}>
                            <div className="gym-form-group" style={{flex:1}}>
                                <label>Latitudine:</label>
                                <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} className="gym-input" required />
                            </div>
                            <div className="gym-form-group" style={{flex:1}}>
                                <label>Longitudine:</label>
                                <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} className="gym-input" required />
                            </div>
                        </div>

                        <div className="gym-form-group">
                            <label>Orar Luni-Vineri:</label>
                            <input type="text" name="orarLuniVineri" value={formData.orarLuniVineri} onChange={handleChange} className="gym-input" placeholder="08:00 - 22:00" />
                        </div>
                        <div className="gym-form-group">
                            <label>Orar Weekend:</label>
                            <input type="text" name="orarSambataDuminica" value={formData.orarSambataDuminica} onChange={handleChange} className="gym-input" placeholder="10:00 - 18:00" />
                        </div>

                        {/*Sectiune Facilitati Dinamice*/}
                        <div className="gym-form-group">
                            <label>Facilitati:</label>
                            <div className="facility-input-wrapper">
                                <input 
                                    type="text" 
                                    value={facilityInput}
                                    onChange={(e) => setFacilityInput(e.target.value)}
                                    placeholder="Scrie o facilitate (ex: Sauna)"
                                    className="gym-input"
                                />
                                <button type="button" onClick={handleAddFacility} className="add-facility-btn">
                                    Adauga
                                </button>
                            </div>
                            <div className="facilities-container">
                                {formData.facilities.length === 0 && <span style={{color:'#999', fontSize:'0.9em'}}>Nicio facilitate adaugata.</span>}
                                {formData.facilities.map((fac, index) => (
                                    <div key={index} className="facility-tag">
                                        {fac}
                                        <button type="button" onClick={() => handleRemoveFacility(fac)} className="remove-tag-btn">×</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                            <button type="submit" disabled={isLoading} style={{
                                flex:1, padding:'12px', background:'#4CAF50', color:'white', border:'none', borderRadius:'6px', cursor:'pointer'
                            }}>
                                {isLoading ? 'Se proceseaza...' : (isEditing ? 'Salveaza Modificari' : 'Creeaza Sala')}
                            </button>
                            {isEditing && (
                                <button type="button" onClick={handleCancel} style={{
                                    padding:'12px', background:'#ddd', border:'none', borderRadius:'6px', cursor:'pointer'
                                }}>
                                    Anuleaza
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/*SECITUNE LISTA*/}
                <div className="gym-list-section">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
                        <h2>Lista Sali ({gyms.length})</h2>
                        <button onClick={onBackToDashboard} style={{
                            padding:'8px 15px', background:'#2196F3', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'
                        }}>
                            Inapoi
                        </button>
                    </div>

                    <table className="gym-table">
                        <thead>
                            <tr>
                                <th>Nume</th>
                                <th>Adresa</th>
                                <th>Actiuni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gyms.map(gym => (
                                <tr key={gym.location_id}>
                                    <td><strong>{gym.nume}</strong></td>
                                    <td>{gym.adresa}</td>
                                    <td>
                                        <div className="gym-row-actions">
                                            <button className="action-btn edit-btn" onClick={() => handleEdit(gym)}>
                                                Edit
                                            </button>
                                            <button className="action-btn delete-btn" onClick={() => handleDelete(gym.location_id)}>
                                                Sterge
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </AppLayout>
    );
}

export default AdminGymsManagement;