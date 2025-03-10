import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './competitor.css';

export function Competitor() {
    const [competitor, setCompetitor] = useState({ name: '', age: '', rank: '' });
    const [events, setEvents] = useState([]);
    const [isInfoActive, setIsInfoActive] = useState(false);
    const [isRingManager, setIsRingManager] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false); // State for menu toggle

    const location = useLocation();
    const navigate = useNavigate();
    const eventName = location.state?.eventName;
    const role = location.state?.role;

    useEffect(() => {
        const storedCompetitor = JSON.parse(sessionStorage.getItem('loggedInUser'));
        if (storedCompetitor) {
            setCompetitor({
                name: storedCompetitor.name,
                age: storedCompetitor.age,
                rank: storedCompetitor.rank
            });
        }

        fetch('/competitorEvents.json')
            .then(response => response.json())
            .then(data => {
                setEvents(data.events);
                const currentEvent = data.events.find(event => event.name === eventName);
                if (currentEvent && currentEvent.role === 'ringManager') {
                    setIsRingManager(true);
                }
            })
            .catch(error => console.error('Error fetching event data:', error));
    }, [eventName]);

    const toggleInfo = () => {
        setIsInfoActive(!isInfoActive);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
            {/* <header>
                <div className="title-container">
                    <h1 style={{ fontFamily: 'Racing_Sans_One' }}>Tournevent</h1>
                    <div id="picture" className="picture-box">
                        <img width="150px" src="kicker.png" alt="random" />
                    </div>
                </div>

            
                <button className="menu-toggle" onClick={toggleMenu}>
                    ☰
                </button>

                <nav>
                    <ul className={`dropdown ${isMenuOpen ? 'show' : ''}`}>
                        <li><a href="/login">Login</a></li>
                        <li><a href="/events">Events</a></li>
                        <li><a href="/about">About</a></li>
                    </ul>
                </nav>
            </header> */}

            <main style={{ fontFamily: 'Exo' }}>
                <p className="quote">You Can Do This! This is an inspirational quote.</p>

                {eventName && <h2>Joined Event: {eventName}</h2>}

                <div className={`info-container ${isInfoActive ? 'active' : ''}`}>
                    <div className="info-header" onClick={toggleInfo} style={{ fontFamily: 'Exo' }}>
                        Your Information ▼
                    </div>
                    {isInfoActive && (
                        <div className="info-content">
                            <h3>Name: {competitor.name}</h3>
                            <h3>Age: {competitor.age}</h3>
                            <h3>Rank: {competitor.rank}</h3>
                        </div>
                    )}
                </div>

                <div className="Events">
                    <h2>Your Events</h2>
                    {events.length > 0 ? (
                        events.map((event, index) => (
                            <fieldset key={index}>
                                <legend className="Events_legend">{event.name}</legend>
                                <table border=".05" width="100%" align="center">
                                    <thead>
                                        <tr>
                                            <th>Ring#</th>
                                            <th>Match#</th>
                                            <th>Current match:</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{event.ring}</td>
                                            <td>{event.match}</td>
                                            <td>{event.currentMatch}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div className="scoring">
                                    Results: -------
                                </div>
                                {isRingManager && (
                                    <button onClick={() => navigate('/admin', { state: { eventName: event.name } })}>
                                        Go to Admin
                                    </button>
                                )}
                            </fieldset>
                        ))
                    ) : (
                        <p>No events registered.</p>
                    )}
                </div>
            </main>

            {/* <footer>
                <h3 style={{ fontFamily: 'ContrailOne' }}>Ty Tanner</h3>
                <a href="https://github.com/TimKaboti/startup">GitHub</a>
            </footer> */}
        </>
    );
}
