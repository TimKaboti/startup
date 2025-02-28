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
        // Get logged in user data from sessionStorage
        const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
        if (loggedInUser) {
            setRole(loggedInUser.role); // Set role from logged-in user data
        }
    }, []);

    const handleJoinEvent = (e) => {
        e.preventDefault();
        if (!selectedEvent) return; // Ensure an event is selected

        const selectedEventData = existingEvents.find(event => event.id === Number(selectedEvent));
        if (selectedEventData) {
            if (role === 'competitor') {
                // Navigate to competitor page with event details
                navigate(`/competitor/${selectedEventData.id}`);
            } else if (role === 'admin') {
                // Navigate to admin page for the selected event
                navigate(`/admin/${selectedEventData.id}`);
            }
        }
    };

    const handleCreateEvent = (e) => {
        e.preventDefault();
        if (!eventName.trim()) return; // Prevent empty event names

        // Create new event object
        const newEvent = { id: existingEvents.length + 1, name: eventName };

        // Update local storage with the new event
        localStorage.setItem('events', JSON.stringify([...existingEvents, newEvent]));

        // Navigate to admin page with the new event details
        navigate(`/admin/${newEvent.id}`);

        // Clear input field
        setEventName('');
    };

    return (
        <>
            {/* Header */}
            {/* <header>
                <div className="title-container">
                    <h1 style={{ fontFamily: 'Racing_Sans_One' }}>Tournevent</h1>
                    <div id="picture" className="picture-box">
                        <img width="150px" src="kicker.png" alt="random" />
                    </div>
                </div>

                <nav>
                    <ul className="dropdown show">
                        <li><a href="/login">Login</a></li>
                        <li><a href="/about">About</a></li>
                    </ul>
                </nav>
            </header> */}

            {/* Main Content */}
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

            {/* Footer */}
            {/* <footer>
                <h3 style={{ fontFamily: 'ContrailOne' }}>Ty Tanner</h3>
                <a href="https://github.com/TimKaboti/startup">GitHub</a>
            </footer> */}
        </>
    );
}
