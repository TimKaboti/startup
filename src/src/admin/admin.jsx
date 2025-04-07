import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import './admin.css';
import { getAuthHeaders } from '../utils/api'; // Adjust path if necessary


export function Admin() {
    const { eventId } = useParams();
    const [rings, setRings] = useState([]);
    const [competitors, setCompetitors] = useState([]);
    const [selectedCompetitor, setSelectedCompetitor] = useState('');
    const [selectedRingId, setSelectedRingId] = useState(null);
    const [tempScores, setTempScores] = useState({});
    const selectedRingIdRef = useRef(null);
    const [eventName, setEventName] = useState('');


    useEffect(() => {
        const fetchRings = async () => {
            try {
                const response = await fetch(`/api/events/${eventId}/rings`, {
                    headers: getAuthHeaders(),
                });
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
        selectedRingIdRef.current = selectedRingId;
    }, [selectedRingId]);


    useEffect(() => {
        const fetchCompetitors = async () => {
            try {
                const response = await fetch(`/api/events/${eventId}/competitors`, {
                    headers: getAuthHeaders(),
                });
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


    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const response = await fetch(`/api/events/${eventId}`, {
                    headers: getAuthHeaders(),
                });
                if (response.ok) {
                    const data = await response.json();
                    setEventName(data.name);
                } else {
                    console.error("❌ Failed to fetch event name");
                }
            } catch (error) {
                console.error("❌ Error fetching event name:", error);
            }
        };

        fetchEventDetails();
    }, [eventId]);


    useEffect(() => {
        const WS_URL = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host + '/socket';
        const socket = new WebSocket(WS_URL);

        socket.onopen = () => {
            console.log('✅ WebSocket connected (Admin view)');
        };

        socket.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            console.log('📨 WebSocket update received (Admin):', msg);

            const isForThisEvent = msg.eventId === eventId;
            if (!isForThisEvent) return;

            // ✅ Capture selected ring ID at message arrival time
            const prevSelectedRingId = selectedRingIdRef.current;

            const relevantUpdate =
                msg.type === "competitor:added" ||
                msg.type === "score:updated" ||
                msg.type === "match:updated" ||
                msg.type === "ring:added";

            if (relevantUpdate) {
                fetch(`/api/events/${eventId}/rings`, {
                    headers: getAuthHeaders(),
                })
                    .then(res => res.json())
                    .then(data => {
                        setRings(data);
                        // ✅ Try to preserve the selected ring if it's still valid
                        const stillExists = data.some(r => r.id === prevSelectedRingId);
                        setSelectedRingId(stillExists ? prevSelectedRingId : null);
                    })
                    .catch(err => console.error("❌ WebSocket-triggered ring fetch error:", err));
            }

            if (msg.type === "competitor:added") {
                fetch(`/api/events/${eventId}/competitors`, {
                    headers: getAuthHeaders(),
                })
                    .then(res => res.json())
                    .then(data => setCompetitors(data))
                    .catch(err => console.error("❌ WebSocket-triggered competitor fetch error:", err));
            }
        };



        socket.onclose = () => {
            console.log('❌ WebSocket disconnected (Admin view)');
        };

        return () => socket.close();
    }, [eventId]);




    const addRing = async () => {
        try {
            console.log(`🔍 Sending request to create a new ring for event ${eventId}...`);

            const response = await fetch(`/api/events/${eventId}/rings`, {
                method: 'POST',
                headers: getAuthHeaders(),
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
                headers: getAuthHeaders()
                ,
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
                headers: getAuthHeaders()
                ,
                body: JSON.stringify({ competitor }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("❌ Error adding competitor to match:", errorData.message);
                return;
            }

            const updatedMatch = await response.json();

            updatedMatch.competitors = updatedMatch.competitors || [];

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
                headers: getAuthHeaders()
                ,
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
                headers: getAuthHeaders()
                ,
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


    const markMatchAsCompleted = async (ringId, matchId) => {
        try {
            console.log(`🔵 Marking match ${matchId} in ring ${ringId} as completed...`);

            const response = await fetch(`/api/events/${eventId}/rings/${ringId}/matches/${matchId}/mark-completed`, {
                method: "PATCH",
                headers: getAuthHeaders()
                ,
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("❌ Error marking match as completed:", errorData.message);
                return;
            }

            console.log(`✅ Match ${matchId} marked as completed!`);

            // 🔥 Update match status in state
            setRings(prevRings =>
                prevRings.map(ring =>
                    ring.id === ringId
                        ? {
                            ...ring,
                            matches: ring.matches.map(match =>
                                match.id === matchId ? { ...match, status: "completed" } : match
                            ),
                        }
                        : ring
                )
            );

        } catch (error) {
            console.error("❌ Error marking match as completed:", error);
        }
    };



    return (
        <main>
            <div className="main_info" style={{ fontFamily: 'Exo' }}>
                <h2>RINGS for Event: {eventName || eventId}</h2>
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
                                        <option
                                            key={competitor.id || competitor._id}
                                            value={JSON.stringify({
                                                ...competitor,
                                                id: competitor.id || competitor._id,
                                            })}
                                        >
                                            {competitor.name}
                                        </option>

                                    ))}
                                </select>
                                <button
                                    onClick={() => {
                                        if (selectedCompetitor) {
                                            const competitorData = JSON.parse(selectedCompetitor);
                                            const fullCompetitor = competitors.find(c => c.email === competitorData.email);
                                            console.log("➡️ Full Competitor Being Sent:", fullCompetitor);

                                            // Ensure we include the 'id' (from the `competitors` list)
                                            addCompetitorToMatch(selectedRingId, match.id, {
                                                id: fullCompetitor._id,
                                                name: fullCompetitor.name,
                                                email: fullCompetitor.email,
                                                score: "",  // Optional: set default
                                            });

                                            setSelectedCompetitor('');
                                        }
                                    }}
                                >
                                    Add Competitor
                                </button>
                                {Array.isArray(match.competitors) && match.competitors.length > 0 ? (
                                    <div>
                                        <button
                                            onClick={() => markMatchAsOngoing(selectedRingId, match.id)}
                                            className="mark-ongoing-btn"
                                        >
                                            Mark as Ongoing
                                        </button>
                                        {/* 🔹 Button to mark match as completed */}
                                        <button
                                            onClick={() => {
                                                markMatchAsCompleted(selectedRingId, match.id);

                                                // 🔥 Temporary shading effect for 1 second
                                                const buttonElement = document.getElementById(`complete-btn-${match.id}`);
                                                if (buttonElement) {
                                                    buttonElement.classList.add("clicked");
                                                    setTimeout(() => buttonElement.classList.remove("clicked"), 1000);
                                                }
                                            }}
                                            id={`complete-btn-${match.id}`}
                                            className="complete-button"
                                        >
                                            Mark Completed
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
