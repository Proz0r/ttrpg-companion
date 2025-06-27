import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { getCharactersByPlayerCount } from '../data/gameData';

const SUIT_CATEGORIES = [
  { id: '4', label: '4 Suits' },
  { id: '2', label: '2 Suits' },
  { id: '1', label: '1 Suit' },
];

const MainScreen = () => {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState({});

  useEffect(() => {
    // Fetch characters from backend
    const fetchCharacters = async () => {
      try {
        const response = await fetch('http://localhost:3001/characters');
        const data = await response.json();
        setCharacters(data);
      } catch (error) {
        console.error('Error fetching characters:', error);
      }
    };
    fetchCharacters();
  }, []);

  const handleCreateCharacter = (suitCount) => {
    navigate(`/create/${suitCount}`);
  };

  const handleResumeCharacter = (characterId) => {
    navigate(`/sheet/${characterId}`);
  };

  const handleEditCharacter = (characterId) => {
    navigate(`/edit/${characterId}`);
  };

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        {SUIT_CATEGORIES.map((category) => (
          <Grid item xs={12} sm={4} key={category.id}>
            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                {category.label}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => handleCreateCharacter(category.id)}
                  sx={{ ml: -1 }}
                >
                  Create Character
                </Button>
              </Box>

              <List>
                {characters[category.id]?.map((character) => (
                  <ListItem
                    key={character.id}
                    secondaryAction={
                      <>
                        <IconButton
                          edge="end"
                          onClick={() => handleEditCharacter(character.id)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => handleResumeCharacter(character.id)}
                        >
                          <PlayArrowIcon />
                        </IconButton>
                      </>
                    }
                  >
                    <ListItemText
                      primary={character.name}
                      secondary={character.archetypes.join(', ')}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MainScreen;
