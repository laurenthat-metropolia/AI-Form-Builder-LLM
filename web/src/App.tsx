import React from 'react';
import './App.css';
import { TopNav } from './components/TopNav';
import { Outlet } from 'react-router-dom';

function App() {
    return (
        <>
            <TopNav />
            <Outlet></Outlet>
        </>
    );
}

export default App;
