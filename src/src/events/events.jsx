import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Events() {
    const navigate = useNavigate(); // Use React Router's navigation hook

    const [eventCode, setEventCode] = useState('');
    const [eventName, setEventName] = useState('');

    // Handle form submission for joining an event
    const handleJoinEvent = (e) => {
        e.preventDefault(); // Prevent page reload
        // Add logic here if needed for validation
        navigate('/competitor', { state: { eventCode } }); // Redirect to competitor screen with event code
    };

    // Handle form submission for creating a new event
    const handleCreateEvent = (e) => {
        e.preventDefault(); // Prevent page reload
        // Add logic here if needed for validation
        navigate('/admin', { state: { eventName } }); // Redirect to admin screen with event name
    };

    return (
        <main className="events-main">
            <h2>Join Existing Event</h2>
            <form onSubmit={handleJoinEvent}>
                <div>
                    <input
                        type="text"
                        placeholder="Event Code"
                        value={eventCode}
                        onChange={(e) => setEventCode(e.target.value)} // Manage state of the input
                    />
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
                        onChange={(e) => setEventName(e.target.value)} // Manage state of the input
                    />
                </div>
                <button type="submit">Create</button>
            </form>
        </main>
    );
}
