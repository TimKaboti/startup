import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
        const foundUser = storedUsers.find(user => user.email === email && user.password === password);

        if (foundUser) {
            localStorage.setItem('loggedInUser', JSON.stringify(foundUser));
            navigate('/events');
        } else {
            alert('Invalid email or password.');
        }
    };

    const handleCreateUser = () => {
        if (!email || !password) {
            alert('Please enter an email and password.');
            return;
        }

        const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
        const userExists = storedUsers.some(user => user.email === email);

        if (userExists) {
            alert('User already exists. Please log in.');
            return;
        }

        const newUser = { email, password };
        localStorage.setItem('users', JSON.stringify([...storedUsers, newUser]));
        alert('User created successfully! You can now log in.');
        setEmail('');
        setPassword('');
    };

    return (
        <main className="index-main" style={{ fontFamily: 'Exo' }}>
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
                <button type="button" onClick={handleCreateUser}>Create</button>
            </form>
        </main>
    );
}
