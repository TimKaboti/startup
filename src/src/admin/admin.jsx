import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './admin.css';

export function Admin() {
    const { eventId } = useParams();
    const [rings, setRings] = useState([]);
    const [competitors, setCompetitors] = useState([]);
    const [selectedCompetitor, setSelectedCompetitor] = useState('');
    const [selectedRingId, setSelectedRingId] = useState(null);

    // 🔥 Fetch rings from backend
    useEffect(() => {
        const fetchRings = async () => {
            try {
                const response = await fetch(`/api/events/${eventId}/rings`);
                if (response.ok) {
                    const data = await response.json();
                    setRings(data);
                } else {
                    console.error("❌ Error fetching rings:", response.statusText);
                }
            } catch (error) {
                console.error("❌ Fetch rings error:", error);
            }
        };

        fetchRings();
    }, [eventId]);

    // 🔥 Fetch competitors for this event
    useEffect(() => {
        const fetchCompetitors = async () => {
            try {
                console.log("🔍 Fetching competitors for event:", eventId);
                const response = await fetch(`/api/events/${eventId}/competitors`);
                if (response.ok) {
                    const data = await response.json();
                    console.log("✅ Competitors fetched:", data);
                    setCompetitors(data);
                } else {
                    console.error("❌ Error fetching competitors:", response.statusText);
                }
            } catch (error) {
                console.error("❌ Fetch competitors error:", error);
            }
        };

        fetchCompetitors();
    }, [eventId]);

    // 🔹 Add a new ring
    const addRing = async () => {
        try {
            console.log("🛠️ Attempting to add a new ring for event:", eventId);

            const response = await fetch(`/api/events/${eventId}/rings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("❌ Error adding ring:", errorData.message);
                return;
            }

            const newRing = await response.json();
            console.log("✅ Ring added successfully:", newRing);

            // Update state to reflect new ring
            setRings((prevRings) => [...prevRings, newRing]);
        } catch (error) {
            console.error("❌ Error adding ring:", error);
        }
    };

    // 🔹 Add a new match to a ring
    const addMatch = async (ringId) => {
        try {
            console.log(`🛠️ Adding match to ring ${ringId} in event ${eventId}`);

            const response = await fetch(`/api/events/${eventId}/rings/${ringId}/matches`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("❌ Error adding match:", errorData.message);
                return;
            }

            const newMatch = await response.json();
            console.log("✅ Match added successfully:", newMatch);

            // 🔥 Update state with the new match
            setRings(prevRings =>
                prevRings.map(ring =>
                    ring.id === ringId ? { ...ring, matches: [...(ring.matches || []), newMatch] } : ring
                )
            );
        } catch (error) {
            console.error("❌ Error adding match:", error);
        }
    };


    // 🔹 Add a competitor to a match
    const addCompetitorToMatch = async (ringId, matchId, competitor) => {
        try {
            console.log(`🛠️ Adding competitor to match ${matchId} in ring ${ringId}`);

            const response = await fetch(`/api/events/${eventId}/rings/${ringId}/matches/${matchId}/add-competitor`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ competitor }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("❌ Error adding competitor to match:", errorData.message);
                return;
            }

            const updatedMatch = await response.json();
            console.log('✅ Competitor added to match:', updatedMatch);

            // 🔥 Update state to reflect changes in UI
            setRings(prevRings =>
                prevRings.map(ring =>
                    ring.id === ringId
                        ? {
                            ...ring,
                            matches: ring.matches.map(match =>
                                match.id === matchId ? updatedMatch : match
                            ),
                        }
                        : ring
                )
            );
        } catch (error) {
            console.error('❌ Error adding competitor to match:', error);
        }
    };




    // 🔹 Update a competitor's score
    const updateCompetitorScore = async (ringId, matchId, competitorId, newScore) => {
        try {
            console.log(`🛠️ Updating score for competitor ${competitorId} in match ${matchId}`);

            const response = await fetch(`/api/events/${eventId}/matches/${matchId}/update-score`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ competitorId, score: newScore }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("❌ Error updating score:", errorData.message);
                return;
            }

            console.log("✅ Score updated successfully.");

            // 🔥 Refresh match data for live updates
            setRings(prevRings =>
                prevRings.map(ring =>
                    ring.id === ringId
                        ? {
                            ...ring,
                            matches: ring.matches.map(match =>
                                match.id === matchId
                                    ? {
                                        ...match,
                                        competitors: match.competitors.map(competitor =>
                                            competitor.id === competitorId
                                                ? { ...competitor, score: newScore }
                                                : competitor
                                        ),
                                    }
                                    : match
                            ),
                        }
                        : ring
                )
            );
        } catch (error) {
            console.error("❌ Error updating score:", error);
        }
    };

    return (
        <main>
            <div className="main_info" style={{ fontFamily: 'Exo' }}>
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

                                {/* Competitor Dropdown */}
                                <div>
                                    <label>Select Competitor:</label>
                                    <select
                                        value={selectedCompetitor}
                                        onChange={(e) => setSelectedCompetitor(e.target.value)}
                                    >
                                        <option value="">Select a Competitor</option>
                                        {competitors.map((competitor) => (
                                            <option key={competitor.id} value={JSON.stringify(competitor)}>
                                                {competitor.name}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => {
                                            if (selectedCompetitor) {
                                                const competitorData = JSON.parse(selectedCompetitor);
                                                addCompetitorToMatch(selectedRingId, match.id, competitorData);
                                                setSelectedCompetitor('');
                                            }
                                        }}
                                    >
                                        Add Competitor
                                    </button>
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
