import { useState, useEffect } from 'react';
import './FirstPage.css';
import AppLayout from './AppLayout';

function FirstPage({onNavigateToLogin,onNavigateToRegister,onNavigateToSubscriptions}){

    return (
        <AppLayout>
             <div className='firstpage-nav'>
                    <button className="firstpage-login-btn" onClick={onNavigateToLogin}>
                        LOGIN
                    </button>
            </div>
            <div className="firstpage-center">
                <h1>BINE AI VENIT!</h1>
                <h2>Incepe transformarea ta astazi</h2>
                <button className="devino-membru-btn" onClick={onNavigateToRegister}>
                    DEVINO MEMBRU
                </button>
                <button className ="firstpage-abonamente-btn" onClick={onNavigateToSubscriptions}>
                    VEZI ABONAMENTE
                </button>
            </div>
        </AppLayout>
    );
};

export default FirstPage;

