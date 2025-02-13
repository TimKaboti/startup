// import React from 'react';
import React, { useState } from 'react';
import './competitor.css';

export function Competitor() {
    // State for toggling the "Your Information" section
    const [isInfoActive, setIsInfoActive] = useState(false);

    // Function to toggle visibility of "Your Information" section
    const toggleInfo = () => {
        setIsInfoActive(!isInfoActive);
    };

    return (
        <main>
            <p className="quote">You Can Do This! This is an inspirational quote.</p>

            {/* Info Section */}
            <div className={`info-container ${isInfoActive ? 'active' : ''}`}>
                <div className="info-header" onClick={toggleInfo}>
                    Your Information ▼
                </div>
                {isInfoActive && (
                    <div className="info-content">
                        <h3>Name:</h3>
                        <p>name</p>
                        <h3>Age:</h3>
                        <p>##</p>
                        <h3>Rank:</h3>
                        <p>**rank**</p>
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
