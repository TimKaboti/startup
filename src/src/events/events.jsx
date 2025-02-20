import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './events.css';

export function Events() {
    const navigate = useNavigate();
    const [eventCode, setEventCode] = useState('');
    const [eventName, setEventName] = useState('');

    const handleJoinEvent = (e) => {
        e.preventDefault();
        navigate('/competitor', { state: { eventCode } });
    };

    const handleCreateEvent = (e) => {
        e.preventDefault();
        navigate('/admin', { state: { eventName } });
    };

    return (
        <main
            className="events-main"
            style={{
                backgroundImage: "url('/blue-sides.jpg')", // Reference from public folder
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
                    <input
                        type="text"
                        placeholder="Event Code"
                        value={eventCode}
                        onChange={(e) => setEventCode(e.target.value)}
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
                        onChange={(e) => setEventName(e.target.value)}
                    />
                </div>
                <button type="submit">Create</button>
            </form>
        </main>
    );
}
