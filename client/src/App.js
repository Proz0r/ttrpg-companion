import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import MainScreen from './components/MainScreen';
import CharacterCreationScreen from './components/CharacterCreationScreen';
import CharacterSheet from './components/CharacterSheet';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>TTRPG Companion</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<MainScreen />} />
            <Route path="/create/:playerCount" element={<CharacterCreationScreen />} />
            <Route path="/edit/:characterId" element={<CharacterCreationScreen />} />
            <Route path="/sheet/:characterId" element={<CharacterSheet />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
