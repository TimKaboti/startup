import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); // React Router's navigate hook

    // Handle form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        // Handle login logic here
        // Redirect after login success
        navigate('/events'); // Navigates to the events page
    };



    return (
        <main className="index-main">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="text"
                        placeholder="email/username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit">Login</button>
                <button type="button" onClick={() => navigate('/create')}>Create</button>
            </form>
        </main>
    );
}
