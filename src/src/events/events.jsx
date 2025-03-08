import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './events.css';
import ErrorBoundary from './ErrorBoundary';

export function Events() {
    const navigate = useNavigate();
    const [selectedEvent, setSelectedEvent] = useState('');
    const [eventName, setEventName] = useState('');
    const [role, setRole] = useState('competitor');

    // Safely retrieve existing events from local storage
    let existingEvents = [];
    try {
        const storedEvents = localStorage.getItem('events');
        console.log("Raw stored events:", storedEvents);
        existingEvents = storedEvents ? JSON.parse(storedEvents) : [];
    } catch (error) {
        console.error("Error parsing stored events:", error);
    }

    useEffect(() => {
        try {
            const storedUser = sessionStorage.getItem('loggedInUser');
            console.log("Raw stored user:", storedUser);
            const loggedInUser = storedUser ? JSON.parse(storedUser) : null;
            if (loggedInUser) {
                setRole(loggedInUser.role);
            }
        } catch (error) {
            console.error("Error parsing logged-in user data:", error);
        }
    }, []);

    const handleJoinEvent = (e) => {
        e.preventDefault();
        if (!selectedEvent) return;

        const selectedEventData = existingEvents.find(event => event.id === Number(selectedEvent));
        console.log("Selected event data:", selectedEventData);

        if (selectedEventData) {
            if (role === 'competitor') {
                navigate(`/competitor/${selectedEventData.id}`);
            } else if (role === 'admin') {
                navigate(`/admin/${selectedEventData.id}`);
            }
        }
    };

    const handleCreateEvent = (e) => {
        e.preventDefault();
        if (!eventName.trim()) return;

        const newEvent = { id: existingEvents.length + 1, name: eventName };
        console.log("Creating new event:", newEvent);

        localStorage.setItem('events', JSON.stringify([...existingEvents, newEvent]));

        navigate(`/admin/${newEvent.id}`);
        setEventName('');
    };

    return (
        <ErrorBoundary>
            <main className="events-main">
                <h2>Join Existing Event</h2>
                <form onSubmit={handleJoinEvent}>
                    <div>
                        <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
                            <option value="" disabled>Select an Event</option>
                            {existingEvents.map(event => (
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
