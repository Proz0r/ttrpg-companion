import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import './App.css';
import MainScreen from './components/MainScreen';
import CharacterCreationScreen from './components/CharacterCreationScreen';
import CharacterSheet from './components/CharacterSheet';
import CharacterSelect from './components/CharacterSelect';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0'
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828'
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
      <div className="App">
        <header className="App-header" style={{
          padding: '10px',
          marginBottom: '20px'
        }}>
          <h1 style={{
            fontSize: '24px',
            margin: 0
          }}>TTRPG Companion</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<MainScreen />} />
            <Route path="/create/:slot" element={<CharacterCreationScreen />} />
            <Route path="/sheet/:slot" element={<CharacterSheet />} />
            <Route path="/characters" element={<CharacterSelect />} />
            <Route path="/edit/:slot" element={<CharacterCreationScreen />} />
          </Routes>
        </main>
      </div>
    </Router>
    </ThemeProvider>
  );
}

export default App;
