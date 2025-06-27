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

const steps = ['Suit Role', 'Attributes', 'Archetypes', 'Skills'];

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
    skills: [],
    level: 1,
    availablePoints: 4 // Start with 4 additional points
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

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleCancel = () => {
    navigate('/');
  };

  const handleSave = async () => {
    try {
      if (characterId) {
        // Update existing character
        await fetch(`${process.env.REACT_APP_API_URL}/characters/${characterId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(characterData),
        });
      } else {
        // Create new character
        const response = await fetch(`${process.env.REACT_APP_API_URL}/characters`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...characterData,
            level: 1 // Set initial level to 1 for new characters
          }),
        });
        const data = await response.json();
        navigate(`/sheet/${data.id}`);
      }
    } catch (error) {
      console.error('Error saving character:', error);
    }
  };

  const handleSuitRoleChange = (event) => {
    const selectedSuit = event.target.value;
    setCharacterData(prev => ({
      ...prev,
      suitRoles: [...new Set([...prev.suitRoles, selectedSuit])]
    }));
  };

  // Automatically distribute points when moving to attributes step
  // Calculate total points based on level and number of suit roles
  const calculateTotalPoints = (level, suitRoles) => {
    if (!suitRoles || !suitRoles.length) return 0;
    
    // Base points are 2 per suit role
    const basePoints = 2 * suitRoles.length;
    // Additional points are 4 + (level-1)*2
    const additionalPoints = 4 + (level-1)*2;
    return basePoints + additionalPoints;
  };

  // Calculate additional points based on level
  const calculateAdditionalPoints = (level) => {
    // Start with 4 points at level 1, +2 per level
    return 4 + (level-1)*2;
  };

  // Calculate current total points from attributes
  const calculateCurrentPoints = (attributes) => {
    return Object.values(attributes).reduce((sum, value) => sum + value, 0);
  };

  useEffect(() => {
    if (activeStep === 1) {
      // Initialize attributes with base points per suit role
      const newAttributes = {
        clubs: 0,
        diamonds: 0,
        hearts: 0,
        spades: 0,
      };

      // Distribute base points to selected suit roles
      const basePoints = 2;
      characterData.suitRoles.forEach(suit => {
        newAttributes[suit] = basePoints;
      });

      // Start with 4 additional points
      setCharacterData(prev => ({
        ...prev,
        attributes: newAttributes,
        availablePoints: 4 // Always start with 4 additional points
      }));
    }
  }, [activeStep, characterData.suitRoles]);

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

  // Update available points when attributes change or level changes
  useEffect(() => {
    if (!characterData.suitRoles || !characterData.suitRoles.length) {
      return;
    }

    const currentPoints = calculateCurrentPoints(characterData.attributes);
    const basePoints = 2 * characterData.suitRoles.length;
    // Get additional points based on current level
    const additionalPoints = calculateAdditionalPoints(characterData.level);
    
    // Calculate spent points (subtract base points since they're automatic)
    const spentPoints = currentPoints - basePoints;
    
    setCharacterData(prev => ({
      ...prev,
      availablePoints: Math.max(0, additionalPoints - spentPoints)
    }));
  }, [characterData.attributes, characterData.suitRoles, characterData.level]);

  const handleNameChange = (event) => {
    setCharacterData(prev => ({
      ...prev,
      name: event.target.value
    }));
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Choose Suit Roles
            </Typography>
            <Typography variant="body1" gutterBottom>
              Select {suitCountLabels[playerCount]} for your character
            </Typography>
            <Grid container spacing={2}>
              {availableSuits.map(suit => (
                <Grid item xs={12} sm={6} key={suit}>
                  <Card>
                    <CardContent>
                      <FormControl fullWidth>
                        <InputLabel>{suit.charAt(0).toUpperCase() + suit.slice(1)}</InputLabel>
                        <Select
                          value={characterData.suitRoles.includes(suit) ? suit : ''}
                          onChange={handleSuitRoleChange}
                          label={suit}
                          disabled={characterData.suitRoles.length >= maxSuitRoles}
                        >
                          <MenuItem value={suit}>{suit.charAt(0).toUpperCase() + suit.slice(1)}</MenuItem>
                        </Select>
                      </FormControl>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {characterData.suitRoles.length > 0 && (
              <Box mt={2}>
                <Typography variant="subtitle1">
                  Selected Suit Roles: {characterData.suitRoles.join(', ')}
                </Typography>
              </Box>
            )}
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Attributes
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Character Name"
                  value={characterData.name}
                  onChange={handleNameChange}
                  sx={{ mb: 3 }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Character Level</InputLabel>
                  <Select
                    value={characterData.level}
                    onChange={(e) => handleLevelChange(e.target.value)}
                    label="Character Level"
                  >
                    <MenuItem value={1}>Level 1</MenuItem>
                    <MenuItem value={2}>Level 2</MenuItem>
                    <MenuItem value={3}>Level 3</MenuItem>
                    <MenuItem value={4}>Level 4</MenuItem>
                    <MenuItem value={5}>Level 5</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" gutterBottom>
                  Base points per suit role: 2 points
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Additional points to spend: {calculateAdditionalPoints(characterData.level)} points
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Total Points: {characterData.suitRoles && characterData.suitRoles.length 
                    ? calculateTotalPoints(characterData.level, characterData.suitRoles) 
                    : 0}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Available Points: {characterData.availablePoints}
                </Typography>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                  Base Points Spent: {characterData.suitRoles && characterData.suitRoles.length 
                    ? calculateCurrentPoints(characterData.attributes) - (2 * characterData.suitRoles.length)
                    : 0}
                </Typography>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                  Maximum Points: {characterData.level === 1 ? 3 :
                                 characterData.level === 2 ? 4 :
                                 characterData.level === 3 ? 4 :
                                 5}
                </Typography>
              </Grid>
              {Object.entries(characterData.attributes).map(([attribute, value]) => (
                <Grid item xs={12} sm={6} key={attribute}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {attribute.charAt(0).toUpperCase() + attribute.slice(1)}
                      </Typography>
                      <Typography variant="h4" gutterBottom>
                        {value}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          onClick={() => handleAttributeChange(attribute, value + 1)}
                          disabled={
                            value >= (characterData.level === 1 ? 3 :
                                    characterData.level === 2 ? 4 :
                                    characterData.level === 3 ? 4 :
                                    5) ||
                            calculateCurrentPoints(characterData.attributes) >= calculateTotalPoints(characterData.level, characterData.suitRoles)
                          }
                        >
                          +1
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => handleAttributeChange(attribute, value - 1)}
                          disabled={value <= (characterData.suitRoles.includes(attribute) ? 2 : 0)}
                        >
                          -1
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Archetypes
            </Typography>
            <ArchetypeSelection
              selectedArchetypes={characterData.archetypes}
              setSelectedArchetypes={(archetypes) => 
                setCharacterData(prev => ({ ...prev, archetypes }))
              }
              suitRoles={characterData.suitRoles}
              availableArchetypes={getAvailableArchetypes(characterData.suitRoles)}
            />
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Skills
            </Typography>
            <SkillSelection
              selectedSkills={characterData.skills}
              setSelectedSkills={(skills) => 
                setCharacterData(prev => ({ ...prev, skills }))
              }
              suitRoles={characterData.suitRoles}
            />
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        {characterId ? 'Edit Character' : 'Create Character'}
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {getStepContent(activeStep)}

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
            {characterId ? 'Update' : 'Create'}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
          >
            Next
          </Button>
        )}
        <Button
          color="error"
          onClick={handleCancel}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default CharacterCreationScreen;
