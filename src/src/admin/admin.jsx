import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './admin.css';

export function Admin() {
    const { eventId } = useParams();
    const [rings, setRings] = useState([]);
    const [competitors, setCompetitors] = useState([]);
    const [selectedCompetitor, setSelectedCompetitor] = useState('');
    const [selectedRingId, setSelectedRingId] = useState(null);
    const [tempScores, setTempScores] = useState({});

    useEffect(() => {
        const fetchRings = async () => {
            try {
                const response = await fetch(`/api/events/${eventId}/rings`);
                if (response.ok) {
                    const data = await response.json();
                    setRings(data);
                }
            } catch (error) {
                console.error("❌ Fetch rings error:", error);
            }
        };
        fetchRings();
    }, [eventId]);

    useEffect(() => {
        const fetchCompetitors = async () => {
            try {
                const response = await fetch(`/api/events/${eventId}/competitors`);
                if (response.ok) {
                    const data = await response.json();
                    setCompetitors(data);
                }
            } catch (error) {
                console.error("❌ Fetch competitors error:", error);
            }
        };
        fetchCompetitors();
    }, [eventId]);

    const addRing = async () => {
        try {
            console.log(`🔍 Sending request to create a new ring for event ${eventId}...`);

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

            // 🔥 Update UI with new ring from backend
            setRings(prevRings => [...prevRings, newRing]);

        } catch (error) {
            console.error("❌ Error adding ring:", error);
        }
    };


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

            // 🔥 Update UI state
            setRings(prevRings => prevRings.map(ring =>
                ring.id === ringId ? { ...ring, matches: [...(ring.matches || []), newMatch] } : ring
            ));
        } catch (error) {
            console.error("❌ Error adding match:", error);
        }
    };


    const addCompetitorToMatch = async (ringId, matchId, competitor) => {
        if (!ringId || !matchId) {
            console.error("❌ Cannot add competitor, missing ring or match ID!");
            return;
        }

        try {
            console.log(`🔹 Adding ${competitor.name} to match ${matchId} in ring ${ringId}...`);

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

    const updateCompetitorScore = async (ringId, matchId, competitorId, newScore) => {
        try {
            console.log(`🛠️ Updating score for competitor ${competitorId} in match ${matchId}`);

            const response = await fetch(`/api/events/${eventId}/rings/${ringId}/matches/${matchId}/update-score`, {
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

            // 🔥 Refresh local state to reflect score update
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


    const markMatchAsOngoing = async (ringId, matchId) => {
        try {
            console.log(`🔹 Marking Match ${matchId} in Ring ${ringId} as Ongoing...`);

            const response = await fetch(`/api/events/${eventId}/rings/${ringId}/matches/${matchId}/mark-ongoing`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("❌ Error marking match as ongoing:", errorData.message);
                return;
            }

            const updatedMatch = await response.json();
            console.log("✅ Match marked as ongoing:", updatedMatch);

            // 🔥 Update UI state
            setRings(prevRings =>
                prevRings.map(ring =>
                    ring.id === ringId
                        ? {
                            ...ring,
                            matches: ring.matches.map(match =>
                                match.id === matchId ? updatedMatch : { ...match, status: "upcoming" }
                            ),
                        }
                        : ring
                )
            );
        } catch (error) {
            console.error("❌ Error updating match status:", error);
        }
    };


    return (
        <main>
            <div className="main_info" style={{ fontFamily: 'Exo' }}>
                <h2>RINGS for Event {eventId}</h2>
                <button onClick={addRing}>Add Ring</button>
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
                        {rings.find(ring => ring.id === selectedRingId)?.matches?.map((match) => (
                            <div key={match.id} className="match">
                                <h5>Match {match.id}</h5>
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
                                {match.competitors.length > 0 ? (
                                    <div>
                                        <button
                                            onClick={() => markMatchAsOngoing(selectedRingId, match.id)}
                                            className="mark-ongoing-btn"
                                        >
                                            Mark as Ongoing
                                        </button>

                                        {match.competitors.map((competitor) => (
                                            <div key={`${match.id}-${competitor.id}`} className="competitor-row">
                                                <span className="competitor-name">{competitor.name}</span>
                                                <input style={{ width: 150 }}
                                                    type="text"
                                                    className="score-input"
                                                    value={tempScores[`${match.id}-${competitor.id}`] ?? competitor.score ?? ""}
                                                    onChange={(e) => {
                                                        const newScore = e.target.value;
                                                        setTempScores(prevScores => ({
                                                            ...prevScores,
                                                            [`${match.id}-${competitor.id}`]: newScore,
                                                        }));
                                                    }}
                                                    onBlur={() => {
                                                        if (tempScores[`${match.id}-${competitor.id}`] !== undefined) {
                                                            updateCompetitorScore(selectedRingId, match.id, competitor.id, tempScores[`${match.id}-${competitor.id}`]);

                                                            // ✅ Clear tempScores after sending update
                                                            setTempScores(prevScores => {
                                                                const updatedScores = { ...prevScores };
                                                                delete updatedScores[`${match.id}-${competitor.id}`];
                                                                return updatedScores;
                                                            });
                                                        }
                                                    }}
                                                    placeholder="Enter Score"
                                                />

                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>No competitors in this match yet.</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
