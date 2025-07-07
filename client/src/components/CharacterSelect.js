import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { loadCharacters, removeCharacterBySlot } from '../utils/characterStorage';

const CharacterSelect = () => {
  const navigate = useNavigate();
  const [characterSlots, setCharacterSlots] = useState([]);

  const fetchCharacters = () => {
    const characters = loadCharacters();
    const slots = Array.from({ length: 8 }, (_, i) => ({ id: i + 1, character: null }));

    characters.forEach(char => {
      const index = slots.findIndex(s => String(s.id) === String(char.slot));
      if (index !== -1) {
        slots[index].character = char;
      }
    });

    setCharacterSlots(slots);
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  const handleDelete = (slotId) => {
    const confirmed = window.confirm('Are you sure you want to delete this character?');
    if (confirmed) {
      removeCharacterBySlot(slotId);
      fetchCharacters(); // Refresh the list
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Character Selection
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Select or create a character to play
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {characterSlots.map((slot) => (
          <Grid item xs={12} sm={6} md={3} key={slot.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6">Slot {slot.id}</Typography>
                {slot.character ? (
                  <>
                    <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>
                      {slot.character.name || 'Unnamed Character'}
                    </Typography>
                    <Box sx={{ marginTop: 'auto' }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => navigate(`/sheet/${slot.id}`)}
                        sx={{ mb: 1 }}
                      >
                        View
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => navigate(`/edit/${slot.id}`)}
                        sx={{ mb: 1 }}
                      >
                        Edit
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        onClick={() => handleDelete(slot.id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </>
                ) : (
                  <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      onClick={() => navigate(`/create/${slot.id}`)}
                    >
                      Create Character
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CharacterSelect;
