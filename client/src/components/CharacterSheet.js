import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Checkbox,
  FormControlLabel,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import { io } from 'socket.io-client';
import './CharacterSheet.css';
import SkillSelection from './SkillSelection';
import ArchetypeSelection from './ArchetypeSelection';
import FactionDisplay from './FactionDisplay';
import { 
  SUITS, 
  ARCHETYPES, 
  MAX_ATTRIBUTE_POINTS
} from '../data/gameData';

const CharacterSheet = () => {
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [playerCount, setPlayerCount] = useState('4');
  const [name, setName] = useState('');
  const [race, setRace] = useState('');
  const [selectedSuitRoles, setSelectedSuitRoles] = useState([]);
  const [selectedArchetypes, setSelectedArchetypes] = useState([]);
  const [skillPoints, setSkillPoints] = useState(0);
  const [genericSkills, setGenericSkills] = useState({});
  const [suitSkills, setSuitSkills] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteCharacterId, setDeleteCharacterId] = useState(null);
  const [selectedSuit, setSelectedSuit] = useState(null);
  const [selectedFaction, setSelectedFaction] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState(null);

  useEffect(() => {
    const socket = io('http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('characterCreated', (character) => {
      setCharacters(prev => [...prev, character]);
      setLoading(false);
      setSuccessMessage('Character created successfully!');
    });

    socket.on('characterUpdated', (character) => {
      setCharacters(prev => prev.map(c => c.id === character.id ? character : c));
      setLoading(false);
      setSuccessMessage('Character updated successfully!');
    });

    socket.on('characterDeleted', (id) => {
      setCharacters(prev => prev.filter(c => c.id !== id));
      setLoading(false);
      setSuccessMessage('Character deleted successfully!');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const response = await fetch('http://localhost:3001/characters');
      const data = await response.json();
      setCharacters(data);
    } catch (error) {
      console.error('Error fetching characters:', error);
    }
  };

  const getAvailableArchetypes = () => {
    return getAvailableArchetypes(selectedSuitRoles);
  };

  const handleCreateCharacter = async () => {
    if (!name || !race || !playerCount) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate archetype selection
    const availableArchetypes = getAvailableArchetypes(selectedSuitRoles);
    if (selectedArchetypes.length !== availableArchetypes.length) {
      setError(`Please select ${availableArchetypes.length} archetypes`);
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:3001/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          race,
          suitRoles: selectedSuitRoles,
          archetypes: selectedArchetypes,
          skillPoints,
          genericSkills,
          suitSkills
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create character');
      }

      setName('');
      setRace('');
      setSelectedSuitRoles([]);
      setSelectedArchetypes([]);
      setSkillPoints(0);
      setGenericSkills({});
      setSuitSkills({});
      setSelectedSuit(null);
      setSelectedFaction(null);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // Handle point spending
  const handleSpendPoints = async () => {
    if (!selectedCharacter || !selectedAttribute) {
      setError('Please select an attribute to spend points on');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`http://localhost:3001/characters/${selectedCharacter.id}/points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attribute: selectedAttribute,
          points: 1
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to spend points');
      }

      const updatedCharacter = await response.json();
      setSelectedCharacter(updatedCharacter);
      setSuccessMessage('Points spent successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleEdit = () => {
    navigate(`/edit/${selectedCharacter.id}`);
  };

  const handleDelete = async () => {
    try {
      await fetch(`http://localhost:3001/characters/${selectedCharacter.id}`, {
        method: 'DELETE',
      });
      socketRef.current.emit('characterDeleted', selectedCharacter.id);
      navigate('/');
    } catch (error) {
      console.error('Error deleting character:', error);
    }
  };

  if (!selectedCharacter) {
    return <Box>Loading...</Box>;
  }

  return (
    <Box p={3}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">
            Character Sheet
          </Typography>
          <Box>
            <Button
              variant="text"
              onClick={handleBack}
              sx={{ mr: 2 }}
            >
              Back to Main Menu
            </Button>
            <Button
              variant="contained"
              onClick={handleEdit}
              sx={{ mr: 2 }}
            >
              Edit Character
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              Delete Character
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Character Info */}
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Character Info
                </Typography>
                <Typography>Name: {selectedCharacter.name}</Typography>
                <Typography>Suit Roles: {selectedCharacter.suitRoles.join(', ')}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Archetypes */}
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Archetypes
                </Typography>
                {selectedCharacter.archetypes.map((archetypeId) => (
                  <Typography key={archetypeId}>
                    {ARCHETYPES[archetypeId].name}
                  </Typography>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Attributes */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Attributes
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(selectedCharacter.attributes).map(([attr, value]) => (
                    <Grid item xs={6} sm={3} key={attr}>
                      <Typography>
                        {attr}: {value}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Skills */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Skills
                </Typography>
                {selectedCharacter.skills.map((skill) => (
                  <Typography key={skill}>{skill}</Typography>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Factions */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Factions
                </Typography>
                <FactionDisplay archetypes={selectedCharacter.archetypes} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Delete Character</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this character? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CharacterSheet;
