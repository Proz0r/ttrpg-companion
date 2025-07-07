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

const SkillSelection = ({ character, setSkills }) => {
  const [availablePoints, setAvailablePoints] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState({});
  const [suitPoints, setSuitPoints] = useState({});
  const theme = useTheme();

  useEffect(() => {
    if (!character) return;
    
    // Calculate points per suit
    const suitPoints = {
      clubs: character.attributes?.clubs || 0,
      diamonds: character.attributes?.diamonds || 0,
      hearts: character.attributes?.hearts || 0,
      spades: character.attributes?.spades || 0,
    };

    // Calculate available points from attributes
    const attributePoints = Object.values(suitPoints).reduce((acc, points) => acc + Math.floor(points / 2), 0);
    setAvailablePoints(attributePoints);

    // Calculate skill points per suit
    const skillPoints = {};
    const suits = Object.keys(SUITS);
    suits.forEach(suit => {
      skillPoints[suit] = Math.floor(suitPoints[suit] / 2);
    });
    setSuitPoints(skillPoints);
  }, [character]);

  const handleSkillSelect = (skill, suit) => {
    const newSkills = { ...selectedSkills };
    if (newSkills[skill]) {
      delete newSkills[skill];
    } else {
      if (availablePoints > 0) {
        newSkills[skill] = suit;
        setAvailablePoints(availablePoints - 1);
      }
    }
    setSelectedSkills(newSkills);
    setSkills(newSkills);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Skills
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        You have {availablePoints} skill points to spend. Each skill costs 1 point.
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Generic Skills
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(GENERIC_SKILLS).map(([skill, { name, description }]) => (
              <Grid item xs={12} sm={6} md={4} key={skill}>
                <SkillCard
                  className={selectedSkills[skill] ? 'skill-selected' : ''}
                  onClick={() => handleSkillSelect(skill, 'generic')}
                  sx={{
                    backgroundColor: selectedSkills[skill] ? 'primary.light' : 'background.paper',
                    color: selectedSkills[skill] ? 'primary.contrastText' : 'text.primary'
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    {name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {description}
                  </Typography>
                  {selectedSkills[skill] && (
                    <Typography color="primary" sx={{ mt: 1 }}>
                      Selected
                    </Typography>
                  )}
                </SkillCard>
              </Grid>
            ))}
          </Grid>
        </Grid>
        {Object.entries(SUIT_SKILLS).map(([suit, skills]) => (
          <Grid item xs={12} key={suit}>
            <Typography variant="h6" gutterBottom>
              {SUITS[suit]} Skills
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(skills).map(([skill, { name, description }]) => (
                <Grid item xs={12} sm={6} md={4} key={skill}>
                  <SkillCard
                    className={selectedSkills[skill] === suit ? 'skill-selected' : ''}
                    onClick={() => handleSkillSelect(skill, suit)}
                    sx={{
                      backgroundColor: selectedSkills[skill] === suit ? 'primary.light' : 'background.paper',
                      color: selectedSkills[skill] === suit ? 'primary.contrastText' : 'text.primary'
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      {name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {description}
                    </Typography>
                    {selectedSkills[skill] === suit && (
                      <Typography color="primary" sx={{ mt: 1 }}>
                        Selected
                      </Typography>
                    )}
                  </SkillCard>
                </Grid>
              ))}
            </Grid>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SkillSelection;
