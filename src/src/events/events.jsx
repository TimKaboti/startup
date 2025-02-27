import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import './events.css';

export function Events() {
    const navigate = useNavigate();
    const [eventCode, setEventCode] = useState('');
    const [eventName, setEventName] = useState('');
    const [eventsList, setEventsList] = useState([]); // State to hold the list of events

    useEffect(() => {
        // Retrieve existing events from local storage on component mount
        const existingEvents = JSON.parse(localStorage.getItem('events')) || [];
        setEventsList(existingEvents); // Update the events list state
    }, []);

    const handleJoinEvent = (e) => {
        e.preventDefault();
        // Ensure an event is selected before navigating
        if (!eventCode) return; // If no event code is selected, exit the function.

        // Navigate to the Competitor page, passing the selected event name
        navigate('/competitor', { state: { eventName: eventCode } });
    };

    const handleCreateEvent = (e) => {
        e.preventDefault();
        if (!eventName.trim()) return; // Prevent empty event names

        // Create new event object
        const newEvent = { id: eventsList.length + 1, name: eventName };

        // Update local storage with the new event
        localStorage.setItem('events', JSON.stringify([...eventsList, newEvent]));

        // Navigate to admin page with event details
        navigate('/admin', { state: { eventName } });

        // Clear input field
        setEventName('');
        setEventsList([...eventsList, newEvent]); // Update the local events list
    };

    return (
        <main
            className="events-main"
            style={{
                fontFamily: 'Exo',
                backgroundImage: "url('/blue-sides.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed',
                minHeight: '100vh'
            }}
        >
            <h2>Join Existing Event</h2>
            <form onSubmit={handleJoinEvent}>
                <div>
                    <select
                        value={eventCode}
                        onChange={(e) => setEventCode(e.target.value)}
                    >
                        <option value="">Select an Event</option>
                        {eventsList.map((event) => (
                            <option key={event.id} value={event.name}>
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
