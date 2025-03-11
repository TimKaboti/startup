import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './competitor.css';

export function Competitor() {
    const [competitor, setCompetitor] = useState({ name: '', age: '', rank: '', id: null });
    const [matches, setMatches] = useState([]);
    const [eventId, setEventId] = useState(null);
    const location = useLocation();
    const eventName = location.state?.eventName;

    useEffect(() => {
        // 🔥 Get logged-in competitor details
        const storedCompetitor = JSON.parse(sessionStorage.getItem('loggedInUser'));
        if (storedCompetitor) {
            setCompetitor({
                name: storedCompetitor.name,
                age: storedCompetitor.age,
                rank: storedCompetitor.rank,
                id: storedCompetitor.id,
            });

            // 🔥 Extract event ID from session storage if available
            if (storedCompetitor.eventId) {
                setEventId(storedCompetitor.eventId);
            }
        }
    }, []);

    useEffect(() => {
        if (competitor.id && eventId) {
            const fetchCompetitorMatches = async () => {
                try {
                    const response = await fetch(`/api/events/${eventId}/competitor/${competitor.id}/matches`);
                    if (response.ok) {
                        const data = await response.json();
                        setMatches(data);
                    } else {
                        console.error("Error fetching competitor matches:", response.statusText);
                    }
                } catch (error) {
                    console.error("Error fetching competitor matches:", error);
                }
            };

            // Fetch matches every 5 seconds for real-time updates
            const interval = setInterval(fetchCompetitorMatches, 5000);
            fetchCompetitorMatches();

            return () => clearInterval(interval); // Cleanup on component unmount
        }
    }, [competitor.id, eventId]);

    return (
        <div className="Events">
            <h2>Your Matches</h2>
            {matches.length > 0 ? (
                <table>
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
                                <td>{match.ring}</td>
                                <td>{match.id}</td>
                                <td>{match.currentMatch ? "Ongoing" : "Upcoming"}</td>
                                <td>{match.competitors.find(c => c.id === competitor.id)?.score || "N/A"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No matches assigned yet.</p>
            )}
        </div>
    );
}
