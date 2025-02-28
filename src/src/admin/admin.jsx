import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import './admin.css';

export function Admin() {
    const { eventId } = useParams();
    const [rings, setRings] = useState([]);
    const [competitors, setCompetitors] = useState([]);
    const [selectedCompetitor, setSelectedCompetitor] = useState('');
    const [selectedRingId, setSelectedRingId] = useState(null);

    // Fetch event-specific data based on eventId
    useEffect(() => {
        const storedRings = JSON.parse(localStorage.getItem('rings')) || [];
        setRings(storedRings.filter(ring => ring.eventId === eventId));
    }, [eventId]);

    useEffect(() => {
        // Fetch the competitors who joined the tournament
        const eventCompetitors = JSON.parse(localStorage.getItem('competitors')) || [];
        setCompetitors(eventCompetitors.filter(competitor => competitor.eventId === eventId));
    }, [eventId]);

    const addRing = () => {
        const existingIds = rings.map(ring => ring.id);
        let newRingId = 1;

        while (existingIds.includes(newRingId)) {
            newRingId++;
        }

        const newRing = { id: newRingId, eventId: eventId, matches: [], competitors: [] };
        const updatedRings = [...rings, newRing];
        setRings(updatedRings);
        localStorage.setItem('rings', JSON.stringify(updatedRings));
    };

    const deleteRing = (ringId) => {
        const updatedRings = rings.filter(ring => ring.id !== ringId);
        setRings(updatedRings);
        setSelectedRingId(null);
        localStorage.setItem('rings', JSON.stringify(updatedRings));
    };

    const addMatch = (ringId) => {
        const updatedRings = rings.map(ring => {
            if (ring.id === ringId) {
                const matchNumber = (ring.matches?.length || 0) + 1;
                const newMatch = { id: matchNumber, competitors: [] };
                return { ...ring, matches: [...(ring.matches || []), newMatch] };
            }
            return ring;
        });

        setRings(updatedRings);
        localStorage.setItem('rings', JSON.stringify(updatedRings));
    };

    const addCompetitorToMatch = (ringId, matchId, competitorName) => {
        const updatedRings = rings.map(ring => {
            if (ring.id === ringId) {
                return {
                    ...ring,
                    matches: ring.matches.map(match => {
                        if (match.id === matchId) {
                            return {
                                ...match,
                                competitors: [...match.competitors, { id: Date.now(), name: competitorName, score: 0 }]
                            };
                        }
                        return match;
                    })
                };
            }
            return ring;
        });

        setRings(updatedRings);
        localStorage.setItem('rings', JSON.stringify(updatedRings));
    };

    const updateCompetitorScore = (ringId, matchId, competitorId, newScore) => {
        const updatedRings = rings.map(ring => {
            if (ring.id === ringId) {
                return {
                    ...ring,
                    matches: ring.matches.map(match => {
                        if (match.id === matchId) {
                            return {
                                ...match,
                                competitors: match.competitors.map(competitor =>
                                    competitor.id === competitorId ? { ...competitor, score: newScore } : competitor
                                )
                            };
                        }
                        return match;
                    })
                };
            }
            return ring;
        });

        setRings(updatedRings);
        localStorage.setItem('rings', JSON.stringify(updatedRings));
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
                    <ul className="dropdown">
                        <li><NavLink to="/login">Login</NavLink></li>
                        <li><NavLink to="/events">Events</NavLink></li>
                        <li><NavLink to="/about">About</NavLink></li>
                    </ul>
                </nav>
            </header>

            <div className="main_info" style={{ fontFamily: 'Exo', paddingTop: '100px' }}>
                <h2>RINGS for Event {eventId}</h2>
                <div className="tab-container">
                    {rings.map((ring) => (
                        <div key={ring.id} className="ring-button-container">
                            <button
                                className={`tab ${selectedRingId === ring.id ? 'active' : ''}`}
                                onClick={() => setSelectedRingId(ring.id)}
                            >
                                Ring {ring.id}
                            </button>
                            <button
                                className="delete-ring-button"
                                onClick={() => deleteRing(ring.id)}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>

                {selectedRingId !== null && (
                    <div className="ring-details">
                        <h3>Details for Ring {selectedRingId}</h3>
                        <button onClick={() => addMatch(selectedRingId)}>Add Match</button>
                        <h4>Matches</h4>
                        {rings.find(ring => ring.id === selectedRingId)?.matches?.map((match) => (
                            <div key={match.id} className="match">
                                <h5>Match {match.id}</h5>
                                <div>
                                    <label>Select Competitor:</label>
                                    <select
                                        value={selectedCompetitor}
                                        onChange={(e) => setSelectedCompetitor(e.target.value)}
                                    >
                                        <option value="">Select a Competitor</option>
                                        {competitors.map((competitor, index) => (
                                            <option key={index} value={competitor.name}>
                                                {competitor.name}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => {
                                            if (selectedCompetitor.trim() !== '') {
                                                addCompetitorToMatch(selectedRingId, match.id, selectedCompetitor.trim());
                                                setSelectedCompetitor('');
                                            }
                                        }}
                                    >
                                        Add Competitor
                                    </button>
                                </div>

                                <div className="competitors">
                                    <h4>Scores</h4>
                                    {match.competitors.map((competitor) => (
                                        <div key={competitor.id} className="competitor-row">
                                            <span className="competitor-name">{competitor.name}</span>
                                            <input
                                                type="text"
                                                className="score-input"
                                                value={competitor.score}
                                                onChange={(e) => updateCompetitorScore(selectedRingId, match.id, competitor.id, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <button onClick={addRing}>Add Ring</button>
            </div>

            <footer>
                <h3 style={{ fontFamily: 'ContrailOne' }}>Ty Tanner</h3>
                <a href="https://github.com/TimKaboti/startup">GitHub</a>
            </footer>
        </div>
    );
}
