import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCharacterBySlot, removeCharacterBySlot } from '../utils/characterStorage';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';

const CharacterSheet = () => {
  const navigate = useNavigate();
  const { slot } = useParams();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    setLoading(true);
    try {
      const characterData = getCharacterBySlot(slot);
      if (characterData) {
        setCharacter(characterData);
      } else {
        setError(`Character not found in slot ${slot}.`);
      }
    } catch (e) {
      setError('Failed to load character data from storage.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [slot]);

  const handleEdit = () => {
    navigate(`/edit/${slot}`);
  };

  const handleReturnToSelect = () => {
    navigate('/characters');
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    try {
      removeCharacterBySlot(slot);
      navigate('/');
    } catch (e) {
      setError('Failed to delete character.');
      console.error(e);
    } finally {
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="outlined" onClick={handleReturnToSelect} sx={{ mt: 2 }}>
          Return to Character Select
        </Button>
      </Box>
    );
  }

  if (!character) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No character data available for this slot.</Alert>
        <Button variant="outlined" onClick={handleReturnToSelect} sx={{ mt: 2 }}>
          Return to Character Select
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Character Sheet
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleEdit}>
          Edit Character
        </Button>
        <Button variant="outlined" onClick={handleReturnToSelect}>
          Return to Character Select
        </Button>
        <Button variant="outlined" color="error" onClick={handleDelete}>
          Delete Character
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Info */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
              <Typography variant="body1">Name: {character.name || 'N/A'}</Typography>
              <Typography variant="body1">Race: {character.race || 'N/A'}</Typography>
              <Typography variant="body1">Level: {character.level || 1}</Typography>
              <Typography variant="body1">Background: {character.background || 'N/A'}</Typography>
              <Typography variant="body1">Appearance: {character.appearance || 'N/A'}</Typography>
              <Typography variant="body1">Personality: {character.personality || 'N/A'}</Typography>
              <Typography variant="body1">Backstory: {character.backstory || 'N/A'}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Attributes */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Attributes</Typography>
              {character.attributes && Object.entries(character.attributes).map(([attr, value]) => (
                <Typography key={attr} variant="body1">
                  {attr.charAt(0).toUpperCase() + attr.slice(1)}: {value}
                </Typography>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Suits and Archetypes */}
        <Grid item xs={12}>
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Suits and Archetypes</Typography>
              <Box mb={2}>
                <Typography variant="subtitle1" gutterBottom>Suit Roles</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {character.suitRolesSelected && character.suitRolesSelected.map((suit) => (
                    <Chip key={suit} label={suit.charAt(0).toUpperCase() + suit.slice(1)} />
                  ))}
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle1" gutterBottom>Archetypes</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {character.archetypes && character.archetypes.map((archetype, index) => (
                    <Chip key={index} label={archetype.name || 'Unknown'} />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Skills */}
        <Grid item xs={12}>
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Skills</Typography>
              <Grid container spacing={1}>
                {character.skills && Object.entries(character.skills).map(([suit, skillSet]) =>
                  Object.entries(skillSet).map(([skill, checked]) =>
                    checked ? (
                      <Grid item xs={12} sm={6} md={4} key={`${suit}-${skill}`}>
                        <Typography variant="body1">{skill}</Typography>
                      </Grid>
                    ) : null
                  )
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Items */}
        <Grid item xs={12}>
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Items</Typography>
              {character.items && character.items.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1">{item.name}</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{item.quantity}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this character? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CharacterSheet;
