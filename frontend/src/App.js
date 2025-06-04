import React from 'react';
import './App.css';
import Calendar from './components/Calendar';
import CalendarSync from './components/CalendarSync';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Modern Calendar App</h1>
      </header>
      <main>
        <CalendarSync />
        <Calendar />
      </main>
    </div>
  );
}

export default App;
