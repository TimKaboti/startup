import React, { useState, useEffect } from 'react';
import './competitor.css';

export function Competitor() {
    const [isInfoActive, setIsInfoActive] = useState(false);
    const [competitor, setCompetitor] = useState({ name: '', age: '', rank: '' });

    useEffect(() => {
        fetch('/competitor.json')
            .then(response => {
                console.log('Fetch Response:', response);
                return response.json();
            })
            .then(data => {
                console.log('Fetched Data:', data);
                setCompetitor(data);
            })
            .catch(error => console.error('Error fetching competitor data:', error));
    }, []);


    const toggleInfo = () => {
        setIsInfoActive(!isInfoActive);
    };

    return (
        <main style={{ fontFamily: 'Exo' }}>
            <p className="quote">You Can Do This! This is an inspirational quote.</p>

            {/* Info Section */}
            <div className={`info-container ${isInfoActive ? 'active' : ''}`}>
                <div className="info-header" onClick={toggleInfo} style={{ fontFamily: 'Exo' }}>
                    Your Information ▼
                </div>
                {isInfoActive && (
                    <div className="info-content" style={{ fontFamily: 'Exo' }}>
                        <h3>Name: {competitor.name}</h3>
                        <h3>Age: {competitor.age}</h3>
                        <h3>Rank: {competitor.rank}</h3>
                    </div>
                )}
            </div>

            {/* Events Section */}
            <div className="Events">
                <h2>Your Events</h2>
                <fieldset>
                    <legend className="Events_legend">Sparring</legend>
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
                                <td>3</td>
                                <td>19</td>
                                <td>14</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="scoring">
                        Results: -------
                    </div>
                </fieldset>

                {/* Notices Section */}
                <fieldset className="notices">
                    <legend>NOTICE!</legend>
                    <p>Your Ring # has changed. Please check it.</p>
                    <p>(websocket notification)</p>
                </fieldset>

                <fieldset className="notices">
                    <legend>NOTICE!</legend>
                    <p>You have 5 matches before you compete, double check your ring# and report quickly.</p>
                    <p>(websocket notification)</p>
                </fieldset>
            </div>
        </main>
    );
}
