import React, { useState } from 'react';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

import { Login } from './login/login';
import { Events } from './events/events';
import { Admin } from './admin/admin';
import { Competitor } from './competitor/competitor';  // Import Competitor
import { About } from './about/about';

export default function App() {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <BrowserRouter>
            <div className="app">
                <header>
                    <div className="title-container">
                        <h1 style={{ fontFamily: 'Racing_Sans_One' }}>Tournevent</h1>
                        <div id="picture" className="picture-box">
                            <img width="150px" src="kicker.png" alt="random" />
                        </div>
                    </div>
                    <nav>
                        <button className="menu-toggle" onClick={toggleMenu}>
                            ☰
                        </button>
                        <ul className={`dropdown ${menuOpen ? "show" : ""}`}>
                            <li><NavLink to="/login" onClick={() => setMenuOpen(false)}>Login</NavLink></li>
                            <li><NavLink to="/events" onClick={() => setMenuOpen(false)}>Events</NavLink></li>
                            <li><NavLink to="/admin" onClick={() => setMenuOpen(false)}>Admin Screen</NavLink></li>
                            <li><NavLink to="/competitor" onClick={() => setMenuOpen(false)}>Competitor Screen</NavLink></li>
                            <li><NavLink to="/about" onClick={() => setMenuOpen(false)}>About</NavLink></li>
                        </ul>
                    </nav>
                </header>

                <div style={{
                    backgroundImage: 'url(/blue-sides.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    minHeight: '100vh'
                }}>
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/Login" element={<Login />} />
                        <Route path="/admin/:eventId" element={<Admin />} />
                        <Route path="/competitor/:eventId" element={<Competitor />} /> {/* Updated to match /competitor/:eventId */}
                        <Route path="/events" element={<Events />} />
                        <Route path="/about" element={<About />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </div>

                <footer>
                    <h3 style={{ fontFamily: 'ContrailOne' }}>Ty Tanner</h3>
                    <a href="https://github.com/TimKaboti/startup">GitHub</a>
                </footer>
            </div>
        </BrowserRouter>
    );
}

function NotFound() {
    return <main className="container-fluid bg-secondary text-center">404: Return to sender. Address unknown.</main>;
}
