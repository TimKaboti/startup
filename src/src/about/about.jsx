import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './about.css';

export function About() {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
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
                    </ul>
                </nav>
            </header>

            <main
                className="about-main"
                style={{
                    backgroundImage: 'url(/blue-sides.jpg)', // Use absolute path
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    minHeight: '100vh'
                }}
            >
                <div style={{ fontFamily: 'Exo' }}>
                    <p>
                        The Tournevent Tracker is designed to provide athletes with timely and relevant updates when at a
                        competition.
                        It provides to the competitor a list of individual events that the competitor expects to participate in,
                        along
                        with constant updates to inform the athlete that their round or match will be starting soon and where
                        exactly
                        they need to be; extremely helpful for events with large venues. Tournevent also keeps track of the competitors
                        performance and
                        will show them their scores or ranking.
                    </p>
                </div>
            </main>

            <footer>
                <h3 style={{ fontFamily: 'ContrailOne' }}>Ty Tanner</h3>
                <a href="https://github.com/TimKaboti/startup">GitHub</a>
            </footer>
        </div>
    );
}
