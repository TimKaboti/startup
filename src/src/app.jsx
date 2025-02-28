import React, { useState } from 'react';
import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom';
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
                {/* Layout applied only to specific pages */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/about" element={<About />} />
                </Route>

                {/* Admin and Competitor pages outside of MainLayout */}
                <Route path="/admin/:eventId" element={<Admin />} />
                <Route path="/competitor/:eventId" element={<Competitor />} />

                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

function MainLayout() {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation(); // This will now work properly inside BrowserRouter

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    // Determine which menu links should be hidden based on the current screen
    const isOnLoginPage = location.pathname === "/login";
    const isOnAdminPage = location.pathname.startsWith("/admin");
    const isOnCompetitorPage = location.pathname.startsWith("/competitor");

    return (
        <div className="app">
            {/* Header, only visible on pages other than login, admin, and competitor */}
            {!isOnLoginPage && !isOnAdminPage && !isOnCompetitorPage && (
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
                            {!isOnLoginPage && <li><NavLink to="/login" onClick={() => setMenuOpen(false)}>Login</NavLink></li>}
                            {/* {!isOnAdminPage && <li><NavLink to="/admin" onClick={() => setMenuOpen(false)}>Admin Screen</NavLink></li>} */}
                            {/* {!isOnCompetitorPage && <li><NavLink to="/competitor" onClick={() => setMenuOpen(false)}>Competitor Screen</NavLink></li>} */}
                            <li><NavLink to="/events" onClick={() => setMenuOpen(false)}>Events</NavLink></li>
                            <li><NavLink to="/about" onClick={() => setMenuOpen(false)}>About</NavLink></li>
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
                {/* This renders the child routes */}
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/about" element={<About />} />
                    {/* Add more routes as necessary */}
                </Routes>
            </div>

            {/* Footer, only visible on pages other than login, admin, and competitor */}
            {!isOnLoginPage && !isOnAdminPage && !isOnCompetitorPage && (
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
