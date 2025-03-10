import React, { useState } from 'react';
import { BrowserRouter, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

import { Login } from './login/login';
import { Events } from './events/events';
import { Admin } from './admin/admin';
import { Competitor } from './competitor/competitor';
import { About } from './about/about';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<MainLayout hideHeaderFooter={false}><Login /></MainLayout>} />
                <Route path="/" element={<MainLayout><Login /></MainLayout>} />
                <Route path="/events" element={<MainLayout><Events /></MainLayout>} />
                <Route path="/about" element={<MainLayout><About /></MainLayout>} />
                <Route path="/admin/:eventId" element={<MainLayout><Admin /></MainLayout>} />
                <Route path="/competitor/:eventId" element={<Competitor />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

function MainLayout({ hideHeaderFooter = false, children }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        console.log("🔒 Logging out...");
        sessionStorage.clear();
        setMenuOpen(false); // Close the dropdown menu after logout
        navigate("/login");
    };

    return (
        <div className="app">
            {!hideHeaderFooter && (
                <header>
                    <div className="title-container">
                        <h1 style={{ fontFamily: 'Racing_Sans_One' }}>Tournevent</h1>
                        <div id="picture" className="picture-box">
                            <img width="150px" src="kicker.png" alt="random" />
                        </div>
                    </div>
                    <nav>
                        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
                        <ul className={`dropdown ${menuOpen ? "show" : ""}`}>
                            <li><NavLink to="/login" onClick={() => setMenuOpen(false)}>Login</NavLink></li>
                            <li><NavLink to="/events" onClick={() => setMenuOpen(false)}>Events</NavLink></li>
                            <li><NavLink to="/about" onClick={() => setMenuOpen(false)}>About</NavLink></li>
                            <li><button onClick={handleLogout} className="logout-button">Logout</button></li>
                        </ul>
                    </nav>
                </header>
            )}
            <div style={{
                backgroundImage: 'url(/blue-sides.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                minHeight: '100vh'
            }}>
                {children}
            </div>
            {!hideHeaderFooter && (
                <footer>
                    <h3 style={{ fontFamily: 'ContrailOne' }}>Ty Tanner</h3>
                    <a href="https://github.com/TimKaboti/startup">GitHub</a>
                </footer>
            )}
        </div>
    );
}

function NotFound() {
    return <main className="container-fluid bg-secondary text-center">404: Return to sender. Address unknown.</main>;
}
