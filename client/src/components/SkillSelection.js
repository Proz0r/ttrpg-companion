import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Button,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { SUITS, GENERIC_SKILLS, SUIT_SKILLS, SKILL_POINTS_PER_ATTRIBUTE } from '../data/gameData';

const SkillSelection = ({ character, onSkillSelect }) => {
  const [availablePoints, setAvailablePoints] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState({});

  useEffect(() => {
    // Calculate available skill points based on attribute points
    let totalPoints = 0;
    Object.entries(character.attributes).forEach(([suit, points]) => {
      totalPoints += points * SKILL_POINTS_PER_ATTRIBUTE;
    });
    
    // Add archetype bonus points
    totalPoints += character.archetypes?.length * 3 || 0;
    
    // Calculate spent points
    let spentPoints = 0;
    Object.values(selectedSkills).forEach(points => {
      spentPoints += points || 0;
    });
    
    setAvailablePoints(totalPoints - spentPoints);
  }, [character, selectedSkills]);

  const handleSkillSelect = (skill, points) => {
    setSelectedSkills(prev => ({
      ...prev,
      [skill]: points
    }));
    onSkillSelect(selectedSkills);
  };

  const getAvailableSkills = (suit) => {
    return [...GENERIC_SKILLS, ...SUIT_SKILLS[suit]];
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Skill Points: {availablePoints}
      </Typography>
      
      <Grid container spacing={2}>
        {/* Generic Skills */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Generic Skills
          </Typography>
          {GENERIC_SKILLS.map(skill => (
            <FormControlLabel
              key={skill}
              control={
                <Checkbox
                  checked={selectedSkills[skill] > 0}
                  onChange={(e) => handleSkillSelect(skill, e.target.checked ? 1 : 0)}
                  disabled={availablePoints === 0}
                />
              }
              label={`${skill} (${selectedSkills[skill] || 0})`}
            />
          ))}
        </Grid>

        {/* Suit-Specific Skills */}
        {Object.entries(character.attributes).map(([suit, points]) => (
          <Grid item xs={12} key={suit}>
            <Typography variant="subtitle1" gutterBottom>
              {suit.charAt(0).toUpperCase() + suit.slice(1)} Skills
            </Typography>
            {getAvailableSkills(suit).map(skill => (
              <FormControlLabel
                key={skill}
                control={
                  <Checkbox
                    checked={selectedSkills[skill] > 0}
                    onChange={(e) => handleSkillSelect(skill, e.target.checked ? 1 : 0)}
                    disabled={availablePoints === 0}
                  />
                }
                label={`${skill} (${selectedSkills[skill] || 0})`}
              />
            ))}
          </Grid>
        ))}
      </Grid>

      {/* Archetype Bonus Skills */}
      {character.archetypes?.length > 0 && (
        <Box mt={2}>
          <Typography variant="subtitle1" gutterBottom>
            Archetype Bonus Skills
          </Typography>
          {character.archetypes.map(archetype => (
            <Box key={archetype.id}>
              <Typography variant="subtitle2" gutterBottom>
                {archetype.name}
              </Typography>
              {Object.entries(archetype.bonusSkills).map(([type, skill]) => (
                <FormControlLabel
                  key={type}
                  control={
                    <Checkbox
                      checked={selectedSkills[skill] > 0}
                      onChange={(e) => handleSkillSelect(skill, e.target.checked ? 1 : 0)}
                      disabled={availablePoints === 0}
                    />
                  }
                  label={`${skill} (${selectedSkills[skill] || 0})`}
                />
              ))}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default SkillSelection;
