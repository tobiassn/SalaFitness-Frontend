import React, { useState, useEffect } from 'react';
import './Subscriptions.css'; 
import AppLayout from './AppLayout';

const Subscriptions = ({ onBack,onNavigateToLogin }) => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

        //verific daca e logat
        if (!token) {
            alert("Trebuie să fii logat pentru a cumpăra un abonament!");
            onNavigateToLogin();
            return; 
        }

        //confirmare
        const confirmMessage = `Confirmi plata pentru "${plan.name}"?\nPreț: ${plan.price} RON`;
        
        if (window.confirm(confirmMessage)) {
            try {
                const response = await fetch('http://localhost:5001/api/subscriptions/buy', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify({ plan_id: plan.plan_id }) 
                });

                const data = await response.json();

                if (response.ok) {
                    alert("🎉 Felicitări! Abonamentul a fost activat.");
                    onBack(); 
                } else {
                    alert("Eroare: " + data.message);
                }

            } catch (err) {
                console.error(err);
                alert("Nu s-a putut conecta la server.");
            }
        }
    };

    if (loading) return <div className="loading-spinner">⏳ Se încarcă ofertele...</div>;
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