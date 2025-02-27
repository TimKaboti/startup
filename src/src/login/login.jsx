import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [rank, setRank] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [role, setRole] = useState('competitor'); // State for role selection
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find((u) => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem('loggedInUser', JSON.stringify({ ...user, role })); // Include role in user data
            navigate('/events');
        } else {
            alert('Invalid email or password');
        }
    };

    const handleCreateUser = () => {
        if (!email || !password || !name || !age) { // Rank is excluded here
            alert('Please fill in all fields');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.some((u) => u.email === email)) {
            alert('Email already exists');
            return;
        }

        const newUser = { email, password, name, age, rank }; // Keep rank in the new user object
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        alert('User created successfully! You can now log in.');

        setIsCreating(false);
        setEmail('');
        setPassword('');
        setName('');
        setAge('');
        setRank('');
    };

    return (
        <main className="index-main" style={{ fontFamily: 'Exo' }}>
            <h2>{isCreating ? 'Create Account' : 'Login'}</h2>
            <form onSubmit={handleSubmit}>
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
                <div>
                    <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {!isCreating && ( // Role selection only during login
                    <div>
                        <label>
                            <input
                                type="radio"
                                value="competitor"
                                checked={role === 'competitor'}
                                onChange={() => setRole('competitor')}
                            /> Competitor
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="ringManager"
                                checked={role === 'ringManager'}
                                onChange={() => setRole('ringManager')}
                            /> Ring Manager
                        </label>
                    </div>
                )}
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
