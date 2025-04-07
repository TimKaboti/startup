import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './competitor.css';
import { getAuthHeaders } from '../utils/api'; // Adjust path if necessary


export function Competitor() {
    const [competitor, setCompetitor] = useState({ name: '', age: '', rank: '', id: null });
    const [matches, setMatches] = useState([]);
    const [eventId, setEventId] = useState(null);
    const [isInfoOpen, setIsInfoOpen] = useState(false); // 🔥 State for dropdown
    const location = useLocation();
    const eventName = location.state?.eventName;
    const [randomJoke, setRandomJoke] = useState('');
    const [randomFact, setRandomFact] = useState('');
    const [queueAlertMessage, setQueueAlertMessage] = useState('');
    const WS_URL = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/socket`;


    const getMatchPosition = (matchId, ringId) => {
        const ringMatches = matches.filter(m => m.ringId === ringId);
        const matchIndex = ringMatches.findIndex(m => m.id === matchId);
        return matchIndex !== -1 ? matchIndex + 1 : "N/A";
    };


    const fetchCompetitorMatches = async () => {
        try {
            const response = await fetch(`/api/events/${eventId}/competitor/${competitor.id}/matches`, {
                method: "GET",
                headers: getAuthHeaders(),
            });
            if (response.ok) {
                const data = await response.json();
                console.log("🔥 Matches Loaded into State:", data);
                setMatches(data);

                let message = "";

                const ongoingMatch = data.find(match => match.status === "ongoing");
                if (ongoingMatch) {
                    message = "Your match is currently ongoing!";
                } else {
                    const upcomingMatch = data.find(match => match.status === "upcoming");
                    if (upcomingMatch) {
                        const ringMatches = data
                            .filter(m => m.ringId === upcomingMatch.ringId && m.status !== "completed")
                            .sort((a, b) => a.id - b.id);
                        const position = ringMatches.findIndex(m => m.id === upcomingMatch.id);

                        if (position > -1 && position < 5) {
                            if (position === 0) {
                                message = "Your match is next in line!";
                            } else {
                                message = `Your match is #${position + 1} in the queue.`;
                            }
                        }
                    }
                }

                setQueueAlertMessage(message);
            } else {
                console.error("❌ Error fetching competitor matches:", response.statusText);
            }
        } catch (error) {
            console.error("❌ Error fetching competitor matches:", error);
        }
    };


    useEffect(() => {
        // 🔥 Get logged-in competitor details
        const storedCompetitor = JSON.parse(sessionStorage.getItem('loggedInUser'));
        if (storedCompetitor) {
            setCompetitor({
                name: storedCompetitor.name,
                age: storedCompetitor.age,
                rank: storedCompetitor.rank,
                id: storedCompetitor._id,
            });

            if (storedCompetitor.eventId) {
                setEventId(storedCompetitor.eventId);
            }
            console.log("👤 Competitor Loaded:", storedCompetitor);

        }
    }, []);

    useEffect(() => {
        if (competitor.id && eventId) {
            fetchCompetitorMatches();
        }
    }, [competitor.id, eventId]);


    useEffect(() => {
        if (!competitor.id || !eventId) return;

        const socket = new WebSocket(WS_URL);

        socket.onopen = () => {
            console.log('✅ WebSocket connected (Competitor view)');
        };

        socket.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            console.log("📨 WebSocket update received:", msg);

            const isForThisEvent = msg.eventId === eventId;
            const isForThisCompetitor = msg.competitorId === competitor.id;

            // 🔥 Refetch matches if this competitor's score was updated
            if (msg.type === "score:updated" && isForThisEvent && isForThisCompetitor) {
                console.log("🔁 Refetching matches due to score update...");
                fetchCompetitorMatches();
            }

            // 🔥 Refetch on match status changes or new competitor assignment
            if ((msg.type === "match:updated" || msg.type === "competitor:added") && isForThisEvent) {
                fetchCompetitorMatches();
            }
        };



        socket.onclose = () => {
            console.log('❌ WebSocket disconnected (Competitor view)');
        };

        return () => socket.close();
    }, [competitor.id, eventId]);



    useEffect(() => {
        // Fetch a random joke
        fetch("https://v2.jokeapi.dev/joke/Any?type=single")
            .then((response) => response.json())
            .then((data) => {
                if (data.joke) {
                    setRandomJoke(data.joke);
                }
            })
            .catch((error) => console.error("❌ Error fetching joke:", error));

        // Fetch a random fact
        fetch("https://uselessfacts.jsph.pl/random.json?language=en")
            .then((response) => response.json())
            .then((data) => {
                if (data.text) {
                    setRandomFact(data.text);
                }
            })
            .catch((error) => console.error("❌ Error fetching fact:", error));
    }, []); // Empty dependency array ensures it runs once on page load


    return (
        <div className="Events">
            <h2>Your Matches</h2>

            {/* 🔹 Competitor Info Box (Collapsible) */}
            <div className={`info-container ${isInfoOpen ? "active" : ""}`}>
                <div className="info-header" onClick={() => setIsInfoOpen(!isInfoOpen)}>
                    Competitor Information {isInfoOpen ? "▲" : "▼"} {/* 🔥 Toggle icon */}
                </div>
                <div className="info-content" style={{ display: isInfoOpen ? "block" : "none" }}>
                    <p><strong>Name:</strong> {competitor.name}</p>
                    <p><strong>Age:</strong> {competitor.age}</p>
                    <p><strong>Rank:</strong> {competitor.rank}</p>
                </div>
            </div>

            {/* 🔹 Match Table */}
            {matches.length > 0 ? (
                <div className="match-section">
                    <table className="match-table">
                        <thead>
                            <tr>
                                <th>Ring #</th>
                                <th>Match #</th>
                                <th>Current Match</th>
                                <th>Your Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matches.map((match) => (
                                <tr key={match.id}>
                                    <td>{match.ringId || "N/A"}</td>
                                    <td>{match.id}</td>
                                    <td>
                                        {match.status === "ongoing" ? (
                                            <span className="status ongoing">Ongoing</span>
                                        ) : match.status === "completed" ? (
                                            <span className="status completed" style={{ backgroundColor: "blue", color: "white", padding: "5px", borderRadius: "5px" }}>
                                                ✅ Match Completed
                                            </span>
                                        ) : (
                                            <span className="status upcoming">
                                                Upcoming: #{getMatchPosition(match.id, match.ringId)} in queue
                                            </span>
                                        )}
                                    </td>

                                    <td>{match.competitors.find(c => c.id === competitor.id)?.score || "N/A"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            ) : (
                <p>No matches assigned yet.</p>
            )}


            {queueAlertMessage && (
                <div className="queue-alert" style={{
                    padding: "10px",
                    margin: "20px 0",
                    backgroundColor: "#fff3cd",
                    border: "1px solid #ffeeba",
                    borderRadius: "5px",
                    color: "#856404",
                    fontWeight: "500"
                }}>
                    ⚠️ {queueAlertMessage}
                </div>
            )}


            {/* 🔹 Random Joke and Fact Section */}
            <div className="fun-facts">
                <h3>Need a Break?</h3>
                {randomJoke && <p><strong>😂 Joke:</strong> {randomJoke}</p>}
                {randomFact && <p><strong>💡 Fun Fact:</strong> {randomFact}</p>}
            </div>

        </div>
    );
}
