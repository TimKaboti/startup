import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [rank, setRank] = useState('');
    const [role, setRole] = useState('competitor');
    const [isCreating, setIsCreating] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch('http://localhost:4000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store token and user data in sessionStorage or localStorage
                sessionStorage.setItem('authToken', data.token);
                sessionStorage.setItem('loggedInUser', JSON.stringify(data.user));

                // Navigate to the events page
                navigate('/events');
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error logging in:', error);
            alert('Error logging in');
        }
    };


    const handleCreateUser = async () => {
        if (!email || !password || !name || !age || !rank) {
            alert('Please fill in all fields');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.some((u) => u.email === email)) {
            alert('Email already exists');
            return;
        }

        const newUser = { email, password, name, age, rank };

        try {
            const response = await fetch('http://localhost:4000/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            });

            if (response.ok) {
                const createdUser = await response.json();
                alert('User created successfully! You can now log in.');
                setIsCreating(false);
                setEmail('');
                setPassword('');
                setName('');
                setAge('');
                setRank('');
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error creating user:', error);
        }
    };

    return (
        <main className="index-main" style={{ fontFamily: 'Exo' }}>
            <h2>{isCreating ? 'Create Account' : 'Login'}</h2>
            <form onSubmit={handleSubmit} autoComplete="off">
                {isCreating && (
                    <>
                        <div>
                            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div>
                            <input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} />
                        </div>
                        <div>
                            <input type="text" placeholder="Rank" value={rank} onChange={(e) => setRank(e.target.value)} />
                        </div>
                    </>
                )}

                {!isCreating && (
                    <div className="role-selection">
                        <label>
                            <input
                                type="radio"
                                value="competitor"
                                checked={role === 'competitor'}
                                onChange={() => setRole('competitor')}
                            />
                            Competitor
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="admin"
                                checked={role === 'admin'}
                                onChange={() => setRole('admin')}
                            />
                            Admin
                        </label>
                    </div>
                )}

                <div>
                    <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {isCreating ? (
                    <button type="button" onClick={handleCreateUser}>Create Account</button>
                ) : (
                    <button type="submit">Login</button>
                )}
                <button type="button" onClick={() => setIsCreating(!isCreating)}>
                    {isCreating ? 'Back to Login' : 'Create Account'}
                </button>
            </form>
        </main>
    );
}
