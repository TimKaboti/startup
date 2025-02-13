import React, { useState, useEffect } from 'react';

export function Admin() {
    const [rings, setRings] = useState([]);
    const [competitors, setCompetitors] = useState([]);
    const [selectedRingId, setSelectedRingId] = useState(null);

    // Load stored rings from localStorage on mount
    useEffect(() => {
        const storedRings = JSON.parse(localStorage.getItem('rings')) || [];
        setRings(storedRings);
    }, []);

    // Function to add a new ring
    const addRing = () => {
        const newRingId = rings.length ? Math.max(...rings.map(ring => ring.id)) + 1 : 1;
        const newRing = { id: newRingId, matches: [] };
        const updatedRings = [...rings, newRing];
        setRings(updatedRings);
        localStorage.setItem('rings', JSON.stringify(updatedRings));
    };

    // Function to add a competitor
    const addCompetitor = (ringId, competitorName) => {
        const newCompetitor = { id: competitors.length + 1, name: competitorName };
        const updatedCompetitors = [...competitors, newCompetitor];
        setCompetitors(updatedCompetitors);

        const updatedRings = rings.map(ring => {
            if (ring.id === ringId) {
                return { ...ring, competitors: [...ring.competitors, newCompetitor] };
            }
            return ring;
        });
        setRings(updatedRings);
        localStorage.setItem('rings', JSON.stringify(updatedRings));
    };

    // Function to select a ring
    const selectRing = (ringId) => {
        setSelectedRingId(ringId);
    };

    // Function to delete a ring
    const deleteRing = (ringId) => {
        const updatedRings = rings.filter(ring => ring.id !== ringId);
        setRings(updatedRings);
        localStorage.setItem('rings', JSON.stringify(updatedRings));
    };

    return (
        <main>
            <div className="main_info">
                <h2>RINGS</h2>
                <div id="rings-container">
                    {rings.map((ring) => (
                        <div key={ring.id} className={`ring ${selectedRingId === ring.id ? 'selected' : ''}`} onClick={() => selectRing(ring.id)}>
                            <h3>Ring {ring.id}</h3>
                            <button onClick={() => addMatch(ring.id)}>Add Match</button>
                            <button onClick={() => deleteRing(ring.id)}>Delete Ring</button>
                            {/* Match rendering logic here */}
                            <div className="competitor-input">
                                <input type="text" placeholder="Enter competitor name" onChange={(e) => setCompetitorName(e.target.value)} />
                                <button onClick={() => addCompetitor(ring.id, competitorName)}>Add Competitor</button>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ring.competitors && ring.competitors.map((competitor) => (
                                        <tr key={competitor.id}>
                                            <td>{competitor.name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
                <button onClick={addRing}>Add Ring</button>
            </div>
        </main>
    );
}
