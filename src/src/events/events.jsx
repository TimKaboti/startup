import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './events.css';
import ErrorBoundary from './ErrorBoundary';

export function Events() {
    const navigate = useNavigate();
    const [selectedEvent, setSelectedEvent] = useState('');
    const [eventName, setEventName] = useState('');
    const [role, setRole] = useState('competitor');
    const [events, setEvents] = useState([]);

    const fetchEvents = async () => {
        try {
            const response = await fetch('/api/events');
            if (response.ok) {
                const data = await response.json();
                setEvents(data);
            } else {
                console.error('Error fetching events:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    useEffect(() => {
        fetchEvents();
        try {
            const loggedInUserData = sessionStorage.getItem('loggedInUser');
            console.log("Raw loggedInUserData:", loggedInUserData);
            if (loggedInUserData && loggedInUserData !== "undefined") {
                const loggedInUser = JSON.parse(loggedInUserData);
                setRole(loggedInUser.role);
            } else {
                console.warn("No valid logged-in user data found.");
            }
        } catch (error) {
            console.error("Error parsing logged-in user data:", error);
        }
    }, []);

    const handleJoinEvent = async (e) => {
        e.preventDefault();
        console.log("✅ Join event form submitted");

        if (!selectedEvent) {
            console.error("❌ No event selected!");
            alert("Please select an event before joining.");
            return;
        }

        const loggedInUserData = sessionStorage.getItem('loggedInUser');
        if (!loggedInUserData || loggedInUserData === "undefined") {
            console.error("❌ No logged-in user found. Please log in first.");
            alert("You must be logged in to join an event!");
            navigate("/login");
            return;
        }

        let user;
        try {
            user = JSON.parse(loggedInUserData);
            if (!user || !user.email) {
                throw new Error("Invalid user data");
            }
        } catch (error) {
            console.error("❌ Error parsing logged-in user data:", error);
            alert("Invalid user data. Please log in again.");
            sessionStorage.clear();
            navigate("/login");
            return;
        }

        console.log("🔹 User attempting to join:", user);
        console.log("🔹 Selected event ID:", selectedEvent);
        console.log("🔹 Detected user role:", user.role); // ✅ Log the role

        try {
            const response = await fetch(`/api/events/${selectedEvent}/join`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user }),
            });

            console.log("🔹 Response from join API:", response);

            let responseData;
            try {
                responseData = await response.json();
                console.log("🔹 Response JSON:", responseData);
            } catch (err) {
                console.error("❌ Failed to parse JSON response:", err);
                responseData = { message: "Unknown error" };
            }

            // 🔥 If user is already in the event, redirect them immediately
            if (response.status === 400 && responseData.message === "User is already in this event") {
                console.warn("⚠️ User already joined this event. Redirecting now...");

                // 🔥 Ensure correct role-based redirection
                let redirectPath;
                if (user.role === 'competitor') {
                    redirectPath = `/competitor/${selectedEvent}`;
                } else {
                    redirectPath = `/admin/${selectedEvent}`;
                }

                console.log(`🔄 Navigating to ${redirectPath}...`);
                navigate(redirectPath, { replace: true });

                // 🔥 Force browser redirect as a backup
                setTimeout(() => {
                    console.log(`🔄 Forcing browser reload to ${redirectPath}...`);
                    window.location.assign(redirectPath);
                }, 500);
                return;
            }

            if (!response.ok) {
                throw new Error(`Failed to join event: ${responseData.message}`);
            }

            console.log("✅ Successfully joined event:", responseData);

            // 🔥 Ensure correct role-based redirection
            let redirectPath;
            if (user.role === 'competitor') {
                redirectPath = `/competitor/${selectedEvent}`;
            } else {
                redirectPath = `/admin/${selectedEvent}`;
            }

            console.log(`🔄 Navigating to ${redirectPath}...`);
            navigate(redirectPath, { replace: true });

            // 🔥 Force browser redirect as a backup
            setTimeout(() => {
                console.log(`🔄 Forcing browser reload to ${redirectPath}...`);
                window.location.assign(redirectPath);
            }, 500);

        } catch (error) {
            console.error("❌ Error joining event:", error);
            alert(error.message);
        }
    };


    const handleCreateEvent = async (e) => {
        e.preventDefault();
        if (!eventName.trim()) return;

        try {
            const response = await fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: eventName }),
            });

            if (!response.ok) {
                throw new Error('Failed to create event');
            }

            const newEvent = await response.json();
            console.log("Created new event:", newEvent);
            fetchEvents();
            navigate(`/admin/${newEvent.id}`);
            setEventName('');
        } catch (error) {
            console.error("Error creating event:", error);
        }
    };

    return (
        <ErrorBoundary>
            <main className="events-main">
                <h2>Join Existing Event</h2>
                <form onSubmit={handleJoinEvent}>
                    <div>
                        <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
                            <option value="" disabled>Select an Event</option>
                            {events.map(event => (
                                <option key={event.id} value={event.id}>
                                    {event.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit">Join</button>
                </form>

                <h2>Create New Event</h2>
                <form onSubmit={handleCreateEvent}>
                    <div>
                        <input
                            type="text"
                            placeholder="Event Name"
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                        />
                    </div>
                    <button type="submit">Create</button>
                </form>
            </main>
        </ErrorBoundary>
    );
}
