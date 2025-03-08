import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './events.css';
import ErrorBoundary from './ErrorBoundary';

export function Events() {
    const navigate = useNavigate();
    const [selectedEvent, setSelectedEvent] = useState('');
    const [eventName, setEventName] = useState('');
    const [role, setRole] = useState('competitor');
    const [events, setEvents] = useState([]); // This will store fetched events from the backend

    // Fetch existing events from the backend
    const fetchEvents = async () => {
        try {
            const response = await fetch('/api/events');
            if (response.ok) {
                const data = await response.json();
                setEvents(data); // Update state with fetched events
            } else {
                console.error('Error fetching events:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    useEffect(() => {
        fetchEvents(); // Fetch events on mount

        try {
            const loggedInUserData = sessionStorage.getItem('loggedInUser');
            console.log("Raw loggedInUserData:", loggedInUserData); // Debugging log

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
        if (!selectedEvent) return;

        const loggedInUserData = sessionStorage.getItem('loggedInUser');
        if (!loggedInUserData) {
            console.error("No logged-in user found");
            return;
        }

        const user = JSON.parse(loggedInUserData);

        try {
            const response = await fetch(`/api/events/${selectedEvent}/join`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user }),
            });

            if (!response.ok) {
                throw new Error('Failed to join event');
            }

            const updatedEvent = await response.json();
            console.log("Joined event:", updatedEvent);

            // Redirect based on role
            if (user.role === 'competitor') {
                navigate(`/competitor/${updatedEvent.id}`);
            } else if (user.role === 'admin') {
                navigate(`/admin/${updatedEvent.id}`);
            }
        } catch (error) {
            console.error("Error joining event:", error);
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

            fetchEvents(); // Refresh the list of events

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
