import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

export default function App() {
    return (
        <body>

            <header>
                <div className="title-container">
                    <h1>Tournevent</h1>
                    <div id="picture" className="picture-box">
                        <img width="150px" src="kicker.png" alt="random" />
                    </div>
                </div>
                <nav>
                    <button className="menu-toggle">☰</button>
                    <ul className="dropdown">
                        <li><a href="index.html">Login</a></li>
                        <li><a href="events.html">Events</a></li>
                        <li><a href="admin.html">Admin screen</a></li>
                        <li><a href="competitor.html">Competitor screen</a></li>
                        <li><a href="about.html">About</a></li>
                    </ul>
                </nav>
            </header>


            <main className="index-main">
                <h2>Welcome</h2>
            </main>

            <noscript>You need to enable JavaScript to run this app.</noscript>
            <div id="root"></div>
            <script type="module" src="/index.jsx"></script>

            <footer>
                <h3>Ty Tanner</h3>
                <a href="https://github.com/TimKaboti/startup">GitHub</a>
            </footer>
        </body>
    

   );

}
