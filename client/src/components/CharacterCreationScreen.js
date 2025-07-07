import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  ThemeProvider,
  useTheme,
  Checkbox,
  OutlinedInput,
  CircularProgress,
  Alert,
  FormControl,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  TextField,
  Slider
} from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import BasicInfo from './BasicInfo';
import ArchetypeSelection from './ArchetypeSelection';
import ItemSelection from './ItemSelection';
import { ARCHETYPES, SUITS, ITEMS, GENERIC_SKILLS, SUIT_SKILLS, SKILL_POINTS_PER_ATTRIBUTE, getAvailableArchetypes } from '../data/gameData';
import { getCharacterBySlot, saveCharacter, removeCharacterBySlot, updateCharacterBySlot } from '../utils/characterStorage';

const CharacterCreationScreen = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { slot } = useParams();
  const { pathname } = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [characterData, setCharacterData] = useState({
    level: 1,
    suitRoles: 1,
    suitRolesSelected: [],
    attributes: {},
    archetypes: [],
    skills: {},
    name: '',
    race: '',
    background: '',
    appearance: '',
    personality: '',
    backstory: ''
  });

  useEffect(() => {
    const editMode = pathname.startsWith('/edit');
    setIsEditMode(editMode);

    if (editMode) {
      const savedCharacter = getCharacterBySlot(slot);
      if (savedCharacter) {
        setCharacterData(savedCharacter);
      }
    }
    // For create mode, the component will use the initial state for characterData
  }, [pathname, slot]);

  const handleLevelChange = (e) => {
    setCharacterData(prev => ({
      ...prev,
      level: parseInt(e.target.value)
    }));
  };

  const handleSuitRolesChange = (e) => {
    setCharacterData(prev => ({
      ...prev,
      suitRoles: parseInt(e.target.value)
    }));
  };

  const getMaxAttribute = (level) => {
    if (level >= 4) return 5;
    if (level >= 2) return 4;
    return 3;
  };

  const getTrackStyles = (level, value) => {
    const max = getMaxAttribute(level);
    const percentage = (max / 5) * 100;
    
    return {
      '& .MuiSlider-track': {
        backgroundColor: 'transparent',
        backgroundImage: (theme) => `
          linear-gradient(90deg, 
            ${theme.palette.primary.main} ${percentage}%, 
            ${theme.palette.error.main} ${percentage}%`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
      },
      '& .MuiSlider-rail': {
        backgroundColor: (theme) => theme.palette.grey[200],
        opacity: 0.5,
      }
    };
  };

  const getSliderMarks = (level) => {
    const marks = [
      { value: 0, label: '0' },
      { value: 1, label: '1' },
      { value: 2, label: '2' },
      { value: 3, label: '3' }
    ];

    if (level >= 2) {
      marks.push({ value: 4, label: '4' });
    }
    if (level >= 4) {
      marks.push({ value: 5, label: '5' });
    }

    return marks;
  };

  const handleSuitRoleChange = (suit, checked) => {
    setCharacterData(prev => ({
      ...prev,
      suitRolesSelected: checked ? [...prev.suitRolesSelected, suit] : prev.suitRolesSelected.filter(s => s !== suit)
    }));
  };

  const handleAttributeChange = (suit, value) => {
    setCharacterData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [suit]: value
      }
    }));
  };

  const handleCharacterDataChange = (field, value) => {
    setCharacterData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isStepValid = (step) => {
    switch (step) {
      case 0:
        return characterData.suitRolesSelected.length > 0;
      case 1:
        return characterData.archetypes.length > 0;
      case 2:
        return true; // Always allow next in items step
      case 3:
        return characterData.name.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (isStepValid(activeStep)) {
      setActiveStep(prev => prev + 1);
      if (activeStep === 3) {
        saveCharacter(characterData, slot);
        navigate(`/characters/${slot}`);
      }
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleFinish = () => {
    if (isEditMode) {
      updateCharacterBySlot(slot, characterData);
    } else {
      saveCharacter(characterData, slot);
    }
    navigate(`/sheet/${slot}`);
  };

  const steps = ['Level & Attributes', 'Archetypes & Skills', 'Items', 'Background'];

  const STEP_CONTENT = {
    0: {
      title: 'Level & Attributes',
      render: () => (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Level</InputLabel>
                <Select
                  value={characterData?.level || 1}
                  onChange={handleLevelChange}
                  label="Level"
                  defaultValue={1}
                >
                  <MenuItem value={1}>Level 1</MenuItem>
                  <MenuItem value={2}>Level 2</MenuItem>
                  <MenuItem value={3}>Level 3</MenuItem>
                  <MenuItem value={4}>Level 4</MenuItem>
                  <MenuItem value={5}>Level 5</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Suit Roles</InputLabel>
                <Select
                  value={characterData?.suitRoles || 1}
                  onChange={handleSuitRolesChange}
                  label="Suit Roles"
                  defaultValue={1}
                >
                  <MenuItem value={1}>1 Suit Role</MenuItem>
                  <MenuItem value={2}>2 Suit Roles</MenuItem>
                  <MenuItem value={4}>4 Suit Roles</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Suit Roles
          </Typography>
          <Grid container spacing={2}>
            {Object.keys(SUITS).map((suit) => (
              <Grid item xs={12} sm={6} md={3} key={suit}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2">{suit}</Typography>
                      <Checkbox
                        checked={characterData?.suitRolesSelected?.includes(suit)}
                        onChange={(e) => handleSuitRoleChange(suit, e.target.checked)}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {getAvailableArchetypes(suit).join(', ')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Attributes
          </Typography>
          <Grid container spacing={2}>
            {Object.keys(SUITS).map((suit) => (
              <Grid item xs={12} sm={6} md={3} key={suit}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2">{suit}</Typography>
                      <Typography variant="subtitle2" color={(characterData?.attributes?.[suit] || 0) > 0 ? 'success.main' : 'error.main'}>
                        {characterData?.attributes?.[suit] || 0}
                      </Typography>
                    </Box>
                    <Slider
                      value={characterData?.attributes?.[suit] || 0}
                      onChange={(e, newValue) => {
                        const level = characterData?.level || 1;
                        const max = getMaxAttribute(level);
                        const value = parseInt(newValue);
                        if (value <= max) {
                          handleAttributeChange(suit, value);
                        }
                      }}
                      min={0}
                      max={5}
                      step={1}
                      marks={getSliderMarks(characterData?.level)}
                      disabled={false}
                      valueLabelDisplay="auto"
                      sx={getTrackStyles(characterData?.level, characterData?.attributes?.[suit])}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )
    },
    1: {
      title: 'Archetypes & Skills',
      render: () => (
        <ArchetypeSelection
          selectedArchetypes={characterData?.archetypes || []}
          setSelectedArchetypes={(archetypes) => setCharacterData(prev => ({
            ...prev,
            archetypes
          }))}
          suitRolesSelected={characterData?.suitRolesSelected || []}
          characterData={characterData}
          onSkillChange={(skills) => setCharacterData(prev => ({
            ...prev,
            skills
          }))}
        />
      )
    },
    2: {
      title: 'Items',
      render: () => (
        <Box>
          <Typography variant="h6" gutterBottom>
            Items
          </Typography>
          <Grid container spacing={3}>
            {/* Add item selection component here */}
          </Grid>
        </Box>
      )
    },
    3: {
      title: 'Background',
      render: () => (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={characterData?.name || ''}
                onChange={(e) => handleCharacterDataChange('name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Race"
                value={characterData?.race || ''}
                onChange={(e) => handleCharacterDataChange('race', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Background"
                value={characterData?.background || ''}
                onChange={(e) => handleCharacterDataChange('background', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Appearance"
                multiline
                rows={3}
                value={characterData?.appearance || ''}
                onChange={(e) => handleCharacterDataChange('appearance', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Personality"
                multiline
                rows={3}
                value={characterData?.personality || ''}
                onChange={(e) => handleCharacterDataChange('personality', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Backstory"
                multiline
                rows={4}
                value={characterData?.backstory || ''}
                onChange={(e) => handleCharacterDataChange('backstory', e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>
      )
    }
  };

  const renderStepContent = (step) => {
    return (
      <Box>
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={label} completed={activeStep > index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box sx={{ mt: 4 }}>
          {STEP_CONTENT[step].render()}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleFinish}
              disabled={!isStepValid(activeStep)}
            >
              Finish
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!isStepValid(activeStep)}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Edit Character' : 'Create Character'}
      </Typography>
      <Box sx={{ mt: 3 }}>
        {renderStepContent(activeStep)}
      </Box>
    </Box>
  );
};

export default CharacterCreationScreen;
