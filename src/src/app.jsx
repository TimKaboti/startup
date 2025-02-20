import React, { useState } from 'react';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

import { Login } from './login/login';
import { Events } from './events/events';
import { Admin } from './admin/admin';
import { Competitor } from './competitor/competitor';
import { About } from './about/about';

export default function App() {
    // React state for dropdown menu visibility
    const [menuOpen, setMenuOpen] = useState(false);

    // Toggle function for dropdown menu
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    console.log("App component rendered!");


    return (
        <BrowserRouter>
            <div className="app">
                {/* Header Section */}
                <header>
                    <div className="title-container">
                        <h1>Tournevent</h1>
                        <div id="picture" className="picture-box">
                            <img width="150px" src="kicker.png" alt="random" />
                        </div>
                    </div>

                    {/* Navigation Section */}
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

                {/* Routes for different pages */}
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/Login" element={<Login />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/competitor" element={<Competitor />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/about" element={<About />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>

                {/* Footer Section */}
                <footer>
                    <h3>Ty Tanner</h3>
                    <a href="https://github.com/TimKaboti/startup">GitHub</a>
                </footer>
            </div>
        </BrowserRouter>
    );
}

// NotFound Component for 404 Pages
function NotFound() {
    return <main className="container-fluid bg-secondary text-center">404: Return to sender. Address unknown.</main>;
}
