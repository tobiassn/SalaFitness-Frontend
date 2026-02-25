import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from './AppLayout';
import './AdminUsersManagement.css';

function AdminUsersManagement({ onBackToDashboard, onLogout }) {
    const [users, setUsers] = useState([]);
    const [locations, setLocations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });

    //stare pentru editarea in tabel
    const [editingUserId, setEditingUserId] = useState(null);
    const [editForm, setEditForm] = useState({ rol_nou: '', location_id: '' });

    //authfetch refolosibil
    const authFetch = useCallback(async (url, options = {}) => {
        let token = localStorage.getItem('accessToken');
        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        let response = await fetch(url, { ...options, headers });

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
                    const newHeaders = {
                        ...options.headers,
                        'Authorization': `Bearer ${data.accessToken}`,
                        'Content-Type': 'application/json'
                    };
                    response = await fetch(url, { ...options, headers: newHeaders });
                } else {
                    onLogout();
                    return Promise.reject("session expired");
                }
            } catch (err) {
                onLogout();
                return Promise.reject(err);
            }
        }
        return response;
    }, [onLogout]);

    //incarcare date initiale
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            //aducem si userii si salile in paralel
            const [usersRes, locsRes] = await Promise.all([
                authFetch('http://localhost:5001/api/users/all'),
                authFetch('http://localhost:5001/api/gyms')
            ]);

            if (usersRes.ok && locsRes.ok) {
                const usersData = await usersRes.json();
                const locsData = await locsRes.json();
                setUsers(usersData);
                setLocations(locsData);
            } else {
                setMessage({ text: 'eroare la incarcarea datelor.', type: 'error' });
            }
        } catch (err) {
            if (err !== "session expired") {
                setMessage({ text: 'eroare de conexiune.', type: 'error' });
            }
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    //logica de cautare
    const filteredUsers = users.filter(user => {
        const fullString = `${user.nume} ${user.prenume} ${user.username}`.toLowerCase();
        return fullString.includes(searchTerm.toLowerCase());
    });

    //actiuni editare
    const handleEditClick = (user) => {
        setEditingUserId(user.user_id);
        setEditForm({
            rol_nou: user.rol,
            location_id: user.location_id || ''
        });
        setMessage({ text: '', type: '' });
    };

    const handleCancelEdit = () => {
        setEditingUserId(null);
        setEditForm({ rol_nou: '', location_id: '' });
    };

    const handleSaveRole = async (userId) => {
        //validare locala daca e trainer
        if (editForm.rol_nou === 'Trainer' && !editForm.location_id) {
            setMessage({ text: 'selecteaza o sala pentru acest antrenor!', type: 'error' });
            return;
        }

        try {
            const response = await authFetch(`http://localhost:5001/api/users/${userId}/role`, {
                method: 'PATCH',
                body: JSON.stringify({
                    rol_nou: editForm.rol_nou,
                    location_id: editForm.rol_nou === 'Trainer' ? editForm.location_id : null
                })
            });

            if (response.ok) {
                setMessage({ text: 'rol actualizat cu succes!', type: 'success' });
                setEditingUserId(null);
                fetchData(); //reincarcam lista ca sa vedem noile date direct din bd
            } else {
                const errData = await response.json();
                setMessage({ text: errData.message || 'eroare la actualizare.', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'eroare server.', type: 'error' });
        }
    };

    return (
        <AppLayout>
            <div className="users-management-container">
                <div className="users-header">
                    <h2>Gestionare Utilizatori</h2>
                    <button className="back-btn" onClick={onBackToDashboard}>⬅ Inapoi</button>
                </div>

                {message.text && (
                    <div className={`users-message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="users-controls">
                    <input 
                        type="text" 
                        placeholder="Cauta dupa nume sau username..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="users-search-bar"
                    />
                </div>

                <div className="users-table-wrapper">
                    {loading ? (
                        <p style={{textAlign: 'center'}}>se incarca utilizatorii...</p>
                    ) : (
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Nume Complet</th>
                                    <th>Rol Curent</th>
                                    <th>Sala Alocata</th>
                                    <th>Actiuni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user.user_id}>
                                        <td>{user.username}</td>
                                        <td>{user.nume} {user.prenume}</td>
                                        
                                        {editingUserId === user.user_id ? (
                                            //modul de editare
                                            <>
                                                <td>
                                                    <select 
                                                        value={editForm.rol_nou}
                                                        onChange={(e) => setEditForm({...editForm, rol_nou: e.target.value})}
                                                        className="users-select"
                                                    >
                                                        <option value="Client">Client</option>
                                                        <option value="Trainer">Trainer</option>
                                                        <option value="Admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    {editForm.rol_nou === 'Trainer' ? (
                                                        <select
                                                            value={editForm.location_id}
                                                            onChange={(e) => setEditForm({...editForm, location_id: e.target.value})}
                                                            className="users-select"
                                                        >
                                                            <option value="">-- Alege Sala --</option>
                                                            {locations.map(loc => (
                                                                <option key={loc.location_id} value={loc.location_id}>
                                                                    {loc.nume}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <span className="text-muted">-</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="users-actions">
                                                        <button className="action-btn save-btn" onClick={() => handleSaveRole(user.user_id)}>Salveaza</button>
                                                        <button className="action-btn cancel-btn" onClick={handleCancelEdit}>Anuleaza</button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            //modul de vizualizare
                                            <>
                                                <td>
                                                    <span className={`role-badge ${user.rol.toLowerCase()}`}>
                                                        {user.rol}
                                                    </span>
                                                </td>
                                                <td>
                                                    {user.rol === 'Trainer' ? (
                                                        locations.find(l => l.location_id === user.location_id)?.nume || 'Sala stearsa/necunoscuta'
                                                    ) : (
                                                        <span className="text-muted">-</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <button className="action-btn edit-btn" onClick={() => handleEditClick(user)}>
                                                        Modifica
                                                    </button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>
                                            Niciun utilizator gasit.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

export default AdminUsersManagement;