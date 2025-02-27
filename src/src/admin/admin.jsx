import React, { useState, useEffect } from 'react';
import './admin.css';

export function Admin() {
    const [rings, setRings] = useState([]);
    const [competitors, setCompetitors] = useState([]);
    const [competitorName, setCompetitorName] = useState('');
    const [selectedRingId, setSelectedRingId] = useState(null);

    useEffect(() => {
        const storedRings = JSON.parse(localStorage.getItem('rings')) || [];
        setRings(storedRings);
    }, []);

    useEffect(() => {
        localStorage.setItem('rings', JSON.stringify(rings));
    }, [rings]);

    const addRing = () => {
        const existingIds = rings.map(ring => ring.id);
        let newRingId = 1;

        // Find the lowest available ID
        while (existingIds.includes(newRingId)) {
            newRingId++;
        }

        const newRing = { id: newRingId, matches: [], competitors: [] };
        setRings([...rings, newRing]);
    };

    const deleteRing = (ringId) => {
        const updatedRings = rings.filter(ring => ring.id !== ringId);
        setRings(updatedRings);
        setSelectedRingId(null); // Deselect if the deleted ring was selected
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
    };

    return (
        <main>
            <div className="main_info" style={{ fontFamily: 'Exo' }}>
                <h2>RINGS</h2>
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
                                <input
                                    type="text"
                                    placeholder="Competitor Name"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.target.value.trim() !== '') {
                                            addCompetitorToMatch(selectedRingId, match.id, e.target.value.trim());
                                            e.target.value = '';
                                        }
                                    }}
                                />
                                <div className="competitors">
                                    <h4>Competitors</h4>
                                    {match.competitors.map((competitor) => (
                                        <div key={competitor.id} className="competitor-row">
                                            <span className="competitor-name">{competitor.name}</span>
                                            <input
                                                type="number"
                                                className="score-input"
                                                value={competitor.score}
                                                onChange={(e) => updateCompetitorScore(selectedRingId, match.id, competitor.id, parseInt(e.target.value) || 0)}
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
        </main>
    );
}
