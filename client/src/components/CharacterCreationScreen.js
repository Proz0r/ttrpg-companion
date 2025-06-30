import React, { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ARCHETYPES, SUITS, getAvailableArchetypes } from '../data/gameData';
import ArchetypeSelection from './ArchetypeSelection';
import SkillSelection from './SkillSelection';
import { useSocket } from '../context/SocketContext';

const steps = ['Suit Role & Attributes', 'Archetypes & Skills', 'Preview'];

const CharacterCreationScreen = () => {
  const navigate = useNavigate();
  const { playerCount, characterId } = useParams();
  const [activeStep, setActiveStep] = useState(0);
  const [characterData, setCharacterData] = useState({
    name: '',
    suitRoles: [],
    attributes: {
      clubs: 0,
      diamonds: 0,
      hearts: 0,
      spades: 0,
    },
    archetypes: [],
    skills: {},
    level: 1,
    availablePoints: 4
  });
  const socket = useSocket();

  // Determine available suit roles based on player count
  const availableSuits = ['clubs', 'diamonds', 'hearts', 'spades'];
  const suitCountLabels = {
    '4': '4 Suits',
    '2': '2 Suits',
    '1': '1 Suit'
  };
  const maxSuitRoles = parseInt(playerCount);

  useEffect(() => {
    if (characterId) {
      // Load existing character data if editing
      const fetchCharacter = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/characters/${characterId}`);
          const data = await response.json();
          setCharacterData(data);
        } catch (error) {
          console.error('Error loading character:', error);
        }
      };
      fetchCharacter();
    }
  }, [characterId]);

  useEffect(() => {
    if (!Array.isArray(characterData.archetypes)) {
      setCharacterData(prev => ({
        ...prev,
        archetypes: []
      }));
    }
  }, [characterData.archetypes]);

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate suit roles and attributes
      if (characterData.suitRoles.length === 0) {
        alert('Please select at least one suit role');
        return;
      }
      const totalPoints = calculateTotalPoints(characterData.level, characterData.suitRoles);
      const currentPoints = calculateCurrentPoints(characterData.attributes);
      if (currentPoints !== totalPoints) {
        alert(`Please spend all ${totalPoints} points. You have ${totalPoints - currentPoints} points remaining.`);
        return;
      }
    } else if (activeStep === 1) {
      // Validate archetypes and skills
      if (characterData.archetypes.length === 0) {
        alert('Please select at least one archetype');
        return;
      }
      if (Object.values(characterData.skills).some(skill => skill === 0)) {
        alert('Please select all required skills');
        return;
      }
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/characters${characterId ? `/${characterId}` : ''}`, {
        method: characterId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(characterData),
      });
      const data = await response.json();
      navigate(`/sheet/${data.id}`);
    } catch (error) {
      console.error('Error saving character:', error);
      alert('Failed to save character');
    }
  };

  const handleSuitRoleChange = (event) => {
    const selectedSuit = event.target.value;
    setCharacterData(prev => ({
      ...prev,
      suitRoles: [...new Set([...prev.suitRoles, selectedSuit])]
    }));
  };

  // Calculate total points based on level and number of suit roles
  const calculateTotalPoints = (level, suitRoles) => {
    if (!suitRoles || !suitRoles.length) return 0;
    
    // Base points are 2 per suit role
    const basePoints = 2 * suitRoles.length;
    // Additional points are 4 + (level-1)*2
    const additionalPoints = 4 + (level-1)*2;
    return basePoints + additionalPoints;
  };

  // Calculate current total points from attributes
  const calculateCurrentPoints = (attributes) => {
    return Object.values(attributes).reduce((sum, value) => sum + value, 0);
  };

  // Update available points when attributes change or level changes
  useEffect(() => {
    const totalPoints = calculateTotalPoints(characterData.level, characterData.suitRoles);
    const currentPoints = calculateCurrentPoints(characterData.attributes);
    setCharacterData(prev => ({
      ...prev,
      availablePoints: totalPoints - currentPoints
    }));
  }, [characterData.attributes, characterData.level, characterData.suitRoles]);

  const handleLevelChange = (level) => {
    setCharacterData(prev => ({
      ...prev,
      level: parseInt(level)
    }));
  };

  const handleAttributeChange = (attribute, value) => {
    const currentLevel = characterData.level;
    const maxPoints = currentLevel === 1 ? 3 :
                      currentLevel === 2 ? 4 :
                      currentLevel === 3 ? 4 :
                      5;

    // Get the minimum value for this attribute
    const minValue = characterData.suitRoles.includes(attribute) ? 2 : 0;

    // Ensure value is within bounds
    value = Math.max(minValue, value);
    value = Math.min(maxPoints, value);

    setCharacterData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attribute]: value
      }
    }));
  };

  const handleNameChange = (event) => {
    setCharacterData(prev => ({
      ...prev,
      name: event.target.value
    }));
  };

  const handleArchetypeSelect = (archetypes) => {
    setCharacterData(prev => ({
      ...prev,
      archetypes: Array.isArray(archetypes) ? archetypes : []
    }));
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Suit Roles
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel>Suit Role</InputLabel>
                    <Select
                      value={characterData.suitRoles[0] || ''}
                      onChange={handleSuitRoleChange}
                      label="Suit Role"
                    >
                      {Object.entries(SUITS).map(([key, value]) => (
                        <MenuItem key={key} value={key}>
                          {value.charAt(0).toUpperCase() + value.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Attributes
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.entries(SUITS).map(([suit, label]) => (
                      <Grid item xs={12} key={suit}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography>{label.charAt(0).toUpperCase() + label.slice(1)}</Typography>
                          <Box display="flex" alignItems="center">
                            <Button
                              onClick={() => handleAttributeChange(suit, characterData.attributes[suit] - 1)}
                              disabled={characterData.attributes[suit] <= (characterData.suitRoles.includes(suit) ? 2 : 0)}
                            >-</Button>
                            <Typography mx={2}>{characterData.attributes[suit]}</Typography>
                            <Button
                              onClick={() => handleAttributeChange(suit, characterData.attributes[suit] + 1)}
                              disabled={characterData.attributes[suit] >= 5 || characterData.availablePoints === 0}
                            >+</Button>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                    <Typography variant="subtitle2" color="textSecondary">
                      Available Points: {characterData.availablePoints}
                    </Typography>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Select Your Archetypes
                  </Typography>
                  <ArchetypeSelection
                    selectedArchetypes={characterData.archetypes}
                    setSelectedArchetypes={handleArchetypeSelect}
                    suitRoles={characterData.suitRoles}
                    availableArchetypes={getAvailableArchetypes(characterData.suitRoles)}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <SkillSelection
                    character={characterData}
                    onSkillSelect={(skills) => setCharacterData(prev => ({
                      ...prev,
                      skills
                    }))}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Character Preview
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography>Name: {characterData.name}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>Suit Role: {characterData.suitRoles.map(suit => SUITS[suit]).join(', ')}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>Attributes:</Typography>
                  <ul>
                    {Object.entries(characterData.attributes).map(([suit, value]) => (
                      <li key={suit}>{SUITS[suit]}: {value}</li>
                    ))}
                  </ul>
                </Grid>
                <Grid item xs={12}>
                  <Typography>Archetypes:</Typography>
                  <ul>
                    {characterData.archetypes.map(archetype => (
                      <li key={archetype}>{ARCHETYPES[archetype].name}</li>
                    ))}
                  </ul>
                </Grid>
                <Grid item xs={12}>
                  <Typography>Skills:</Typography>
                  <ul>
                    {Object.entries(characterData.skills).map(([skill, points]) => (
                      <li key={skill}>{skill}: {points}</li>
                    ))}
                  </ul>
                </Grid>
              </Grid>
              <Box mt={2} display="flex" justifyContent="space-between">
                <Button onClick={handleBack}>Back</Button>
                <Button onClick={handleSave} variant="contained" color="primary">
                  Save Character
                </Button>
              </Box>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <Box p={3}>
      <Stepper activeStep={activeStep}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box mt={4}>
        {renderStepContent(activeStep)}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSave}
          >
            Save Character
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
          >
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default CharacterCreationScreen;
