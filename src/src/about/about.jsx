import React from 'react';
import './about.css';

export function About() {
    return (
        <main
            className="about-main"
            style={{
                backgroundImage: 'url(/blue-sides.jpg)', // Use absolute path
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                minHeight: '100vh'
            }}
        >
            <div>
                <p>
                    The Tournevent Tracker is designed to provide athletes with timely and relevant updates when at a
                    competition.
                    It provides to the competitor a list of individual events that the competitor expects to participate in,
                    along
                    with constant updates to inform the athlete that their round or match will be starting soon and where
                    exactly
                    they need to be; extremely helpful for events with large venues. Tournevent also keeps track of the competitors
                    performance and
                    will show them their scores or ranking.
                </p>
            </div>
        </main>
    );
}
