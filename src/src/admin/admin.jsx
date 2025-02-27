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

    // Updated addRing function: always picks the smallest missing ring ID
    const addRing = () => {
        setRings(prevRings => {
            let newRingId = 1;
            while (prevRings.some(ring => ring.id === newRingId)) {
                newRingId++;
            }
            console.log("New ring ID:", newRingId);
            return [...prevRings, { id: newRingId, matches: [], competitors: [] }];
        });
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

    const selectRing = (ringId) => {
        console.log("Selecting ring:", ringId);
        const ringExists = rings.some(ring => ring.id === ringId);
        console.log("Ring exists:", ringExists);
        if (ringExists) {
            setSelectedRingId(ringId);
        } else {
            setSelectedRingId(null);
        }
    };

    const deleteRing = (ringId) => {
        const updatedRings = rings.filter(ring => ring.id !== ringId);
        setRings(updatedRings);
        if (selectedRingId === ringId) {
            setSelectedRingId(null);
        }
    };

    return (
        <main>
            <div className="main_info" style={{ fontFamily: 'Exo' }}>
                <h2>RINGS</h2>
                <div className="tab-container">
                    {rings.map((ring) => (
                        <button
                            key={ring.id}
                            className={`tab ${selectedRingId === ring.id ? 'active' : ''}`}
                            onClick={() => selectRing(ring.id)}
                        >
                            Ring {ring.id}
                        </button>
                    ))}
                </div>
                {selectedRingId !== null && (
                    <div className="ring-details">
                        <h3>Details for Ring {selectedRingId}</h3>
                        <button onClick={() => addMatch(selectedRingId)}>Add Match</button>
                        <button onClick={() => deleteRing(selectedRingId)}>Delete Ring</button>
                        <h4>Matches</h4>
                        {rings.find(ring => ring.id === selectedRingId)?.matches?.map((match) => (
                            <div key={match.id} className="match">
                                <h5>Match {match.id}</h5>
                                <p>
                                    Competitors: {match.competitors.length > 0 ? match.competitors.map(c => c.name).join(', ') : "None"}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
                <button onClick={addRing}>Add Ring</button>
            </div>
        </main>
    );
}
