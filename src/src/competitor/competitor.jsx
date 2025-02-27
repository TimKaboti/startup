import React, { useState, useEffect } from 'react';
import './competitor.css';

export function Competitor() {
    const [competitor, setCompetitor] = useState({ name: '', age: '', rank: '' });
    const [events, setEvents] = useState([]);
    const [isInfoActive, setIsInfoActive] = useState(false); // State to control dropdown visibility

    useEffect(() => {
        // Load logged-in user info from localStorage
        const storedUser = JSON.parse(localStorage.getItem('loggedInUser'));

        if (storedUser) {
            setCompetitor(storedUser);
        } else {
            setCompetitor({ name: 'Guest', age: '-', rank: '-' });
        }

        // Fetch competitor's events
        fetch('/competitorEvents.json')
            .then(response => response.json())
            .then(data => setEvents(data.events))
            .catch(error => console.error('Error fetching event data:', error));
    }, []);

    // Function to toggle visibility of "Your Information" section
    const toggleInfo = () => {
        setIsInfoActive(!isInfoActive);
    };

    return (
        <main style={{ fontFamily: 'Exo' }}>
            <p className="quote">You Can Do This! This is an inspirational quote.</p>

            {/* Info Section with Toggle */}
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

            {/* Events Section */}
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
                        </fieldset>
                    ))
                ) : (
                    <p>No events registered.</p>
                )}
            </div>
        </main>
    );
}
