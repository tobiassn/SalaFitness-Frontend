import React, { useState, useEffect, useCallback } from 'react';
import './Subscriptions.css'; 
import AppLayout from './AppLayout';

const Subscriptions = ({ onBack, onNavigateToLogin }) => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const authFetch = useCallback(async (url, options = {}) => {
        let token = localStorage.getItem('accessToken');
        
        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        let response = await fetch(url, { ...options, headers });

        if (response.status === 403 || response.status === 401) {
            console.log("Token expirat la cumparare. Incerc refresh...");

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
                    console.log("Refresh reusit! Reiau cumpararea...");

                    const newHeaders = {
                        ...options.headers,
                        'Authorization': `Bearer ${newToken}`,
                        'Content-Type': 'application/json'
                    };
                    response = await fetch(url, { ...options, headers: newHeaders });

                } else {
                    console.error("Sesiune expirata complet.");
                    onNavigateToLogin(); 
                    return Promise.reject("Session expired"); 
                }
            } catch (err) {
                console.error("Eroare retea la refresh.");
                onNavigateToLogin();
                return Promise.reject(err);
            }
        }

        return response;
    }, [onNavigateToLogin]);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/subscriptions');
                if (!response.ok) throw new Error('Nu am putut incarca lista de abonamente.');
                const data = await response.json();
                setPlans(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const handleBuy = async (plan) => {
        const token = localStorage.getItem('accessToken');

        if (!token) {
            alert("Trebuie sa fii logat pentru a cumpara un abonament!");
            onNavigateToLogin();
            return; 
        }

        const confirmMessage = `Confirmi plata pentru "${plan.name}"?\nPreț: ${plan.price} RON`;
        
        if (window.confirm(confirmMessage)) {
            try {
                const response = await authFetch('http://localhost:5001/api/subscriptions/buy', {
                    method: 'POST',
                    body: JSON.stringify({ plan_id: plan.plan_id }) 
                });

                if (response && response.ok) {
                    const data = await response.json();
                    alert("🎉 Felicitari! " + data.message); 
                    onBack(); 
                } else if (response) {
                    const data = await response.json();
                    alert("Eroare: " + (data.message || "Ceva nu a mers bine."));
                }

            } catch (err) {
                if (err !== "Session expired") {
                    console.error(err);
                    alert("Nu s-a putut conecta la server.");
                }
            }
        }
    };

    if (loading) return <div className="loading-spinner">⏳ Se incarca ofertele...</div>;
    if (error) return <div className="error-message">⚠️ Eroare: {error}</div>;

    return (
        <AppLayout> 
            <div className="subscriptions-page-content">
                <button className="back-to-menu-btn" onClick={onBack}>
                    ⬅ Inapoi
                </button>

                <div className="plans-grid">
                    {plans.map((plan) => (
                        <div 
                            key={plan.plan_id} 
                            className={`plan-card ${plan.duration_days > 30 ? 'featured' : ''}`}
                        >
                            <div className="card-header">
                                <h3>{plan.name.toUpperCase()}</h3>
                                <div className="price-container">
                                    <span className="price">{plan.price}</span>
                                    <span className="currency"> RON</span>
                                    <span className="duration">
                                         {plan.duration_days === 1 ? 'zi' : `${plan.duration_days} zile`}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="card-body">
                                {plan.description && (
                                    <p className="plan-description">{plan.description}</p>
                                )}
                                <ul className="features-list">
                                    <li><span className="check-icon">✓</span> Acces complet la sala</li>
                                    <li><span className="check-icon">✓</span> Vestiar si dusuri incluse</li>
                                    {plan.duration_days >= 30 && (
                                        <li><span className="check-icon">✓</span> Acces la clase de grup</li>
                                    )}
                                    {plan.duration_days > 180 && (
                                        <li><span className="check-icon">✓</span> <strong>Prioritate la rezervari</strong></li>
                                    )}
                                </ul>
                            </div>

                            <button 
                                className={`buy-btn ${plan.duration_days <= 30 ? 'outline' : ''}`}
                                onClick={() => handleBuy(plan)}
                            >
                                ALEGE {plan.name.toUpperCase()}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
};

export default Subscriptions;