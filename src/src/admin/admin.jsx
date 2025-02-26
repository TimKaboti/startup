import React, { useState, useEffect } from 'react';
import './admin.css';

export function Admin() {
    const [rings, setRings] = useState([]);
    const [competitors, setCompetitors] = useState([]);
    const [competitorName, setCompetitorName] = useState('');
    const [selectedRingId, setSelectedRingId] = useState(null);

    // Load stored rings from localStorage on mount
    useEffect(() => {
        const storedRings = JSON.parse(localStorage.getItem('rings')) || [];
        setRings(storedRings);
    }, []);

    // Update localStorage whenever rings change
    useEffect(() => {
        localStorage.setItem('rings', JSON.stringify(rings));
    }, [rings]);

    // Function to add a new ring
    const addRing = () => {
        const newRingId = rings.length ? Math.max(...rings.map(ring => ring.id)) + 1 : 1;
        const newRing = { id: newRingId, matches: [], competitors: [] };
        setRings([...rings, newRing]);
    };

    // Function to add a competitor
    const addCompetitor = (ringId) => {
        if (!competitorName) return; // Validate input

        const newCompetitor = { id: competitors.length + 1, name: competitorName };
        const updatedCompetitors = [...competitors, newCompetitor];
        setCompetitors(updatedCompetitors);

        const updatedRings = rings.map(ring => {
            if (ring.id === ringId) {
                return { ...ring, competitors: [...(ring.competitors || []), newCompetitor] };
            }
            return ring;
        });
        setRings(updatedRings);
        setCompetitorName(''); // Clear input after adding
    };

    // Function to select a ring
    const selectRing = (ringId) => {
        setSelectedRingId(ringId);
    };

    // Function to delete a ring
    const deleteRing = (ringId) => {
        const updatedRings = rings.filter(ring => ring.id !== ringId);
        setRings(updatedRings);
        if (selectedRingId === ringId) {
            setSelectedRingId(null); // Deselect if the deleted ring was selected
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
                {selectedRingId && (
                    <div className="ring-details">
                        <h3>Details for Ring {selectedRingId}</h3>
                        <button onClick={() => addMatch(selectedRingId)}>Add Match</button>
                        <button onClick={() => deleteRing(selectedRingId)}>Delete Ring</button>
                        <div className="competitor-input">
                            <input
                                type="text"
                                placeholder="Enter competitor name"
                                value={competitorName}
                                onChange={(e) => setCompetitorName(e.target.value)}
                            />
                            <button onClick={() => addCompetitor(selectedRingId)}>Add Competitor</button>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rings.find(ring => ring.id === selectedRingId)?.competitors?.map((competitor) => (
                                    <tr key={competitor.id}>
                                        <td>{competitor.name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <button onClick={addRing}>Add Ring</button>
            </div>
        </main>
    );
}
