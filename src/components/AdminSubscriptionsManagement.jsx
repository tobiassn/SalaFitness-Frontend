import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from './AppLayout';
import './AdminSubscriptionsManagement.css';

function AdminSubscriptionsManagement({ onBackToDashboard, onLogout }) {
    const [plans, setPlans] = useState([]);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);
    
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        duration_days: '',
        description: ''
    });

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
                    return Promise.reject("Session expired");
                }
            } catch (err) {
                onLogout();
                return Promise.reject(err);
            }
        }
        return response;
    }, [onLogout]);

    const fetchPlans = useCallback(async () => {
        try {
            const response = await authFetch('http://localhost:5001/api/subscriptions');
            if (response.ok) {
                const data = await response.json();
                setPlans(data);
            }
        } catch (err) {
            console.error(err);
        }
    }, [authFetch]);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (plan) => {
        setIsEditing(true);
        setCurrentId(plan.plan_id);
        setFormData({
            name: plan.name,
            price: plan.price,
            duration_days: plan.duration_days,
            description: plan.description || ''
        });
        setMessage({ text: '', type: '' });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setCurrentId(null);
        setFormData({ name: '', price: '', duration_days: '', description: '' });
        setMessage({ text: '', type: '' });
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Esti sigur ca vrei sa stergi acest abonament?")) return;
        try {
            const response = await authFetch(`http://localhost:5001/api/subscriptions/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setMessage({ text: 'Abonament sters cu succes!', type: 'success' });
                fetchPlans();
            } else {
                const errData = await response.json();
                setMessage({ text: errData.message || 'Eroare la stergere.', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Eroare server.', type: 'error' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const payload = {
            name: formData.name,
            price: parseFloat(formData.price),
            duration_days: parseInt(formData.duration_days),
            description: formData.description
        };

        try {
            const url = isEditing 
                ? `http://localhost:5001/api/subscriptions/${currentId}`
                : `http://localhost:5001/api/subscriptions`;
            
            const method = isEditing ? 'PATCH' : 'POST';

            const response = await authFetch(url, {
                method: method,
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setMessage({ text: isEditing ? 'Abonament actualizat!' : 'Abonament creat!', type: 'success' });
                fetchPlans();
                handleCancel();
            } else {
                const errData = await response.json();
                setMessage({ text: errData.message || 'Eroare.', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Eroare server.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="sub-management-container">
                
                {/* Partea din Stanga: Formularul */}
                <div className="sub-form-section">
                    <h2>{isEditing ? 'Editeaza Abonament' : 'Adauga Abonament'}</h2>
                    {message.text && (
                        <div className={`sub-message ${message.type}`}>
                            {message.text}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="sub-form-group">
                            <label>Nume Abonament:</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="sub-input" required placeholder="ex: Gold Plan" />
                        </div>
                        
                        <div style={{display:'flex', gap:'15px'}}>
                            <div className="sub-form-group" style={{flex:1}}>
                                <label>Pret (RON):</label>
                                <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="sub-input" required placeholder="ex: 150" />
                            </div>
                            <div className="sub-form-group" style={{flex:1}}>
                                <label>Valabilitate (Zile):</label>
                                <input type="number" name="duration_days" value={formData.duration_days} onChange={handleChange} className="sub-input" required placeholder="ex: 30" />
                            </div>
                        </div>

                        <div className="sub-form-group">
                            <label>Descriere / Beneficii:</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} className="sub-input sub-textarea" placeholder="Ce ofera acest abonament?" />
                        </div>

                        <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                            <button type="submit" disabled={isLoading} className="sub-submit-btn">
                                {isLoading ? 'Se proceseaza...' : (isEditing ? 'Salveaza Modificari' : 'Creeaza Abonament')}
                            </button>
                            {isEditing && (
                                <button type="button" onClick={handleCancel} className="sub-cancel-btn">
                                    Anuleaza
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Partea din Dreapta: Lista */}
                <div className="sub-list-section">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
                        <h2>Lista Abonamente ({plans.length})</h2>
                        <button onClick={onBackToDashboard} className="back-btn">
                            ⬅ Inapoi
                        </button>
                    </div>

                    <table className="sub-table">
                        <thead>
                            <tr>
                                <th>Nume</th>
                                <th>Pret</th>
                                <th>Durata</th>
                                <th>Actiuni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plans.map(plan => (
                                <tr key={plan.plan_id}>
                                    <td><strong>{plan.name}</strong></td>
                                    <td>{plan.price} RON</td>
                                    <td>{plan.duration_days} Zile</td>
                                    <td>
                                        <div className="sub-row-actions">
                                            <button className="action-btn edit-btn" onClick={() => handleEdit(plan)}>Edit</button>
                                            <button className="action-btn delete-btn" onClick={() => handleDelete(plan.plan_id)}>Sterge</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {plans.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>Niciun abonament configurat.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </AppLayout>
    );
}

export default AdminSubscriptionsManagement;