import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './events.css';

export function Events() {
    const navigate = useNavigate();
    const [selectedEvent, setSelectedEvent] = useState('');
    const [eventName, setEventName] = useState('');
    const [role, setRole] = useState('competitor'); // Default role

    // Retrieve existing events from local storage
    const existingEvents = JSON.parse(localStorage.getItem('events')) || [];

    useEffect(() => {
        // Get logged in user data from local storage
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (loggedInUser) {
            setRole(loggedInUser.role); // Set role from logged in user data
        }
    }, []);

    const handleJoinEvent = (e) => {
        e.preventDefault();
        if (!selectedEvent) return; // Ensure an event is selected

        const selectedEventData = existingEvents.find(event => event.id === Number(selectedEvent));
        if (selectedEventData) {
            navigate(role === 'competitor' ? '/competitor' : '/admin', { state: { eventName: selectedEventData.name } });
        }
    };

    const handleCreateEvent = (e) => {
        e.preventDefault();
        if (!eventName.trim()) return; // Prevent empty event names

        // Create new event object
        const newEvent = { id: existingEvents.length + 1, name: eventName };

        // Update local storage with the new event
        localStorage.setItem('events', JSON.stringify([...existingEvents, newEvent]));

        // Navigate to admin page with event details
        navigate('/admin', { state: { eventName } });

        // Clear input field
        setEventName('');
    };

    return (
        <main className="events-main" style={{ /* styles */ }}>
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
    );
}
