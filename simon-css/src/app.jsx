import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { Play } from './play/play';
import { Scores } from './scores/scores';
import { About } from './about/about';

export default function App() {
    return (
        < BrowserRouter >
            < div className='body bg-dark text-light' >
                <header className="container-fluid">
                    <nav className='navbar fixed-top navbar-dark'>
                        <div className='navbar-brand'>
                            Simon<sup>&reg;</sup>
                        </div>
                        <menu className='navbar-nav'>
                            <li className='nav-item'>
                                <NavLink className='nav-link' to=''>
                                    Login
                                </NavLink>
                            </li>
                            <li className='nav-item'>
                                <NavLink className='nav-link' to='play'>
                                    Play
                                </NavLink>
                            </li>
                            <li className='nav-item'>
                                <NavLink className='nav-link' to='scores'>
                                    Scores
                                </NavLink>
                            </li>
                            <li className='nav-item'>
                                <NavLink className='nav-link' to='about'>
                                    About
                                </NavLink>
                            </li>
                        </menu>
                    </nav>
                </header>

                <Routes>
                    <Route path='/' element={<Login />} exact />
                    <Route path='/play' element={<Play />} />
                    <Route path='/scores' element={<Scores />} />
                    <Route path='/about' element={<About />} />
                    <Route path='*' element={<NotFound />} />
                </Routes>

                <main className="container-fluid bg-secondary text-center">
                    <div>
                        <h1>Welcome to Simon</h1>
                        <form method="get" action="play.html">
                            <div className="input-group mb-3">
                                <span className="input-group-text">@</span>
                                <input className="form-control" type="text" placeholder="your@email.com" />
                            </div>
                            <div className="input-group mb-3">
                                <span className="input-group-text">🔒</span>
                                <input className="form-control" type="password" placeholder="password" />
                            </div>
                            <button type="submit" className="btn btn-primary">Login</button>
                            <button type="submit" className="btn btn-secondary">Create</button>
                        </form>
                    </div>
                </main>

                <footer className="bg-dark text-white-50">
                    <div className="container-fluid">
                        <span className="text-reset">Author Name(s)</span>
                        <a className="text-reset" href="https://github.com/webprogramming260/simon-css">Source</a>
                    </div>
                </footer>
            </div >
        </BrowserRouter >
    );
}


function NotFound() {
    return <main className='container-fluid bg-secondary text-center'>404: Return to sender. Address unknown.</main>;
}