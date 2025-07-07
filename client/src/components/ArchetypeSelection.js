import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Paper,
  styled,
  useTheme,
  Button,
  OutlinedInput,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  ARCHETYPES,
  SUITS,
  GENERIC_SKILLS,
  SUIT_SKILLS,
  SKILL_POINTS_PER_ATTRIBUTE
} from '../data/gameData';

const SkillCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  },
  '&.skill-selected': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  }
}));

const ArchetypeSelection = ({ selectedArchetypes, setSelectedArchetypes, suitRolesSelected, characterData, onSkillChange }) => {
  const [archetypeGroups, setArchetypeGroups] = useState({});
  const [selectedSkills, setSelectedSkills] = useState({});

  useEffect(() => {
    const groups = {};
    Object.values(ARCHETYPES).forEach(archetype => {
      const suit = archetype.suit;
      if (!groups[suit]) {
        groups[suit] = [];
      }
      groups[suit].push(archetype);
    });
    setArchetypeGroups(groups);
  }, []);

  useEffect(() => {
    if (characterData?.skills) {
      setSelectedSkills(characterData.skills);
    }
  }, [characterData]);

  const handleArchetypeChange = (suit, value) => {
    const newArchetypes = [...selectedArchetypes];
    const index = newArchetypes.findIndex(a => a.suit === suit);
    if (index > -1) {
      newArchetypes[index] = value;
    } else {
      newArchetypes.push(value);
    }
    setSelectedArchetypes(newArchetypes);
  };

  const handleSkillChange = (suit, skill, checked) => {
    const newSelectedSkills = {
      ...selectedSkills,
      [suit]: {
        ...(selectedSkills[suit] || {}),
        [skill]: checked,
      },
    };
    setSelectedSkills(newSelectedSkills);
    if (onSkillChange) {
      onSkillChange(newSelectedSkills);
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {Object.entries(archetypeGroups).map(([suit, archetypes]) => {
          const selectedArchetype = selectedArchetypes.find(a => a.suit === suit);
          return (
            <Grid item xs={12} sm={6} md={4} key={suit}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {suit}
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel>Archetype</InputLabel>
                    <Select
                      value={selectedArchetype?.name || ''}
                      onChange={(e) => handleArchetypeChange(suit, Object.values(ARCHETYPES).find(a => a.name === e.target.value))}
                      label="Archetype"
                    >
                      {archetypes.map((archetype) => (
                        <MenuItem key={archetype.name} value={archetype.name}>
                          {archetype.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {selectedArchetype && (
                    <>
                      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                        Skills
                      </Typography>
                      {selectedArchetype.skills?.map((skill) => (
                        <FormControlLabel
                          key={skill}
                          control={
                            <Checkbox
                              checked={selectedSkills[suit]?.[skill] || false}
                              onChange={(e) => handleSkillChange(suit, skill, e.target.checked)}
                            />
                          }
                          label={skill}
                        />
                      ))}
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ArchetypeSelection;
