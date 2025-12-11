import {useState} from 'react';
import './AuthLayout.css'
import AppLayout from './AppLayout';

const AuthLayout = ({title, children}) => {

    return(
        <AppLayout>
            <div className = "auth-container">
                <div className="auth-card">
                    <h2>{title}</h2>
                    {children}
                 </div>
            </div>
        </AppLayout>
    );
    
};

export default AuthLayout;