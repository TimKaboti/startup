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


    const getMatchPosition = (matchId, ringId) => {
        const ringMatches = matches.filter(m => m.ringId === ringId);
        const matchIndex = ringMatches.findIndex(m => m.id === matchId);
        return matchIndex !== -1 ? matchIndex + 1 : "N/A";
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
                    } else {
                        console.error("❌ Error fetching competitor matches:", response.statusText);
                    }
                } catch (error) {
                    console.error("❌ Error fetching competitor matches:", error);
                }
            };

            fetchCompetitorMatches();
        }
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

            {/* 🔹 Random Joke and Fact Section */}
            <div className="fun-facts">
                <h3>Need a Break?</h3>
                {randomJoke && <p><strong>😂 Joke:</strong> {randomJoke}</p>}
                {randomFact && <p><strong>💡 Fun Fact:</strong> {randomFact}</p>}
            </div>

        </div>
    );
}
