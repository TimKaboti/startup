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
    return (
        <BrowserRouter>
            <Routes>
                {/* Login page without header/footer */}
                <Route path="/login" element={<MainLayout><Login /></MainLayout>} />

                {/* Pages with header/footer */}
                <Route path="/" element={<MainLayout><Login /></MainLayout>} />
                <Route path="/events" element={<MainLayout><Events /></MainLayout>} />
                <Route path="/about" element={<MainLayout><About /></MainLayout>} />
                <Route path="/admin/:eventId" element={<MainLayout><Admin /></MainLayout>} />

                {/* Competitor is separate */}
                <Route path="/competitor/:eventId" element={<Competitor />} />

                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

function MainLayout({ hideHeaderFooter = false, children }) {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => setMenuOpen(!menuOpen);

    return (
        <div className="app">
            {/* Conditionally show header */}
            {!hideHeaderFooter && (
                <header>
                    <div className="title-container">
                        <h1 style={{ fontFamily: 'Racing_Sans_One' }}>Tournevent</h1>
                        <div id="picture" className="picture-box">
                            <img width="150px" src="kicker.png" alt="random" />
                        </div>
                    </div>
                    <nav>
                        <button className="menu-toggle" onClick={toggleMenu}>☰</button>
                        <ul className={`dropdown ${menuOpen ? "show" : ""}`}>
                            <li><NavLink to="/login" onClick={() => setMenuOpen(false)}>Login</NavLink></li>
                            <li><NavLink to="/events" onClick={() => setMenuOpen(false)}>Events</NavLink></li>
                            <li><NavLink to="/about" onClick={() => setMenuOpen(false)}>About</NavLink></li>
                        </ul>
                    </nav>
                </header>
            )}

            {/* Background applied to all pages */}
            <div style={{
                backgroundImage: 'url(/blue-sides.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                minHeight: '100vh'
            }}>
                {children} {/* Render the actual page content */}
            </div>

            {/* Conditionally show footer */}
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
