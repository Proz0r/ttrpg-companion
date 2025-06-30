import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  styled,
  useTheme
} from '@mui/material';
import { 
  SUITS, 
  GENERIC_SKILLS, 
  SUIT_SKILLS, 
  SKILL_POINTS_PER_ATTRIBUTE, 
  ARCHETYPES 
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
  },
}));

const SkillSelection = ({ character, onSkillSelect }) => {
  const [availablePoints, setAvailablePoints] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState({});
  const [suitPoints, setSuitPoints] = useState({});
  const theme = useTheme();

  useEffect(() => {
    // Calculate points per suit
    const suitPoints = {
      clubs: character.attributes.clubs,
      diamonds: character.attributes.diamonds,
      hearts: character.attributes.hearts,
      spades: character.attributes.spades,
      archetype: character.archetypes.length * 3
    };

    // Calculate total points
    const totalPoints = Object.values(suitPoints).reduce((sum, points) => sum + points, 0);
    
    // Calculate spent points
    let spentPoints = 0;
    Object.values(selectedSkills).forEach(points => {
      spentPoints += points || 0;
    });
    
    setAvailablePoints(totalPoints - spentPoints);
    setSuitPoints(suitPoints);
  }, [character, selectedSkills]);

  const handleSkillSelect = (skill, points) => {
    setSelectedSkills(prev => ({
      ...prev,
      [skill]: points
    }));
    onSkillSelect(selectedSkills);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          Skill Selection
        </Typography>
        <Box display="flex" flexDirection="column" alignItems="flex-end">
          <Typography variant="subtitle1" color="primary">
            Points Remaining: {availablePoints}
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
            {Object.entries(suitPoints).map(([suit, points]) => (
              <Box key={suit} display="flex" alignItems="center">
                <Typography variant="caption" mr={0.5}>
                  {suit.charAt(0).toUpperCase() + suit.slice(1)}:
                </Typography>
                <Typography variant="caption" color="primary">
                  {points}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Generic Skills */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Generic Skills
          </Typography>
          <Grid container spacing={2}>
            {GENERIC_SKILLS.map(skill => (
              <Grid item xs={12} sm={6} md={4} key={skill}>
                <SkillCard 
                  className={selectedSkills[skill] ? 'skill-selected' : ''}
                  onClick={() => handleSkillSelect(skill, selectedSkills[skill] ? 0 : 1)}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1">
                      {skill}
                    </Typography>
                    <Typography variant="body1" color="primary">
                      {selectedSkills[skill] || 0}
                    </Typography>
                  </Box>
                </SkillCard>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Suit-Specific Skills */}
        {Object.entries(character.attributes).map(([suit, points]) => {
          if (points === 0) return null;

          return (
            <Grid item xs={12} key={suit}>
              <Typography variant="h6" gutterBottom>
                {suit.charAt(0).toUpperCase() + suit.slice(1)} Skills
              </Typography>
              <Grid container spacing={2}>
                {SUIT_SKILLS[suit]?.map(skill => (
                  <Grid item xs={12} sm={6} md={4} key={skill}>
                    <SkillCard 
                      className={selectedSkills[skill] ? 'skill-selected' : ''}
                      onClick={() => handleSkillSelect(skill, selectedSkills[skill] ? 0 : 1)}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1">
                          {skill}
                        </Typography>
                        <Typography variant="body1" color="primary">
                          {selectedSkills[skill] || 0}
                        </Typography>
                      </Box>
                    </SkillCard>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default SkillSelection;
