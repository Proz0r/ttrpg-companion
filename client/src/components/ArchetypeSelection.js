import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  styled,
  useTheme,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ARCHETYPES, SUITS, getAvailableArchetypes } from '../data/gameData';
import { useSocket } from '../context/SocketContext';
import './ArchetypeSelection.css';

const ArchetypeCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  '&.archetype-card-selected': {
    border: '2px solid #2196f3',
  },
}));

const ArchetypeSelection = ({ selectedArchetypes = [], setSelectedArchetypes, suitRoles = [], availableArchetypes = [] }) => {
  const [expandedSuits, setExpandedSuits] = useState({
    clubs: false,
    diamonds: false,
    hearts: false,
    spades: false,
  });
  const socket = useSocket();

  // Group archetypes by suit
  const archetypesBySuit = {};
  console.log('Available archetypes:', availableArchetypes);
  if (availableArchetypes && availableArchetypes.length > 0) {
    availableArchetypes.forEach(archetype => {
      const suit = archetype.suit;
      console.log('Processing archetype:', archetype);
      if (!archetypesBySuit[suit]) {
        archetypesBySuit[suit] = [];
      }
      archetypesBySuit[suit].push(archetype);
    });
  } else {
    console.log('No available archetypes to process');
  }
  console.log('Archetypes by suit:', archetypesBySuit);

  const handleArchetypeChange = (suit, archetype) => {
    setSelectedArchetypes(prev => {
      const newArchetypes = [...prev];
      const index = newArchetypes.findIndex(a => a === archetype.id);
      if (index !== -1) {
        newArchetypes[index] = archetype.id;
      } else {
        newArchetypes.push(archetype.id);
      }
      
      // Send update to other players
      socket.emit('archetypeSelected', { suit, archetypeId: archetype.id });
      
      return newArchetypes;
    });
  };

  const handleExpandChange = (suit) => (event, isExpanded) => {
    setExpandedSuits(prev => ({
      ...prev,
      [suit]: isExpanded,
    }));
  };

  if (!availableArchetypes || availableArchetypes.length === 0) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Select Your Archetypes
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No archetypes available. Please select suit roles first.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Select Your Archetypes
      </Typography>
      
      {Object.entries(archetypesBySuit).map(([suit, archetypes]) => (
        <Accordion
          key={suit}
          expanded={expandedSuits[suit]}
          onChange={handleExpandChange(suit)}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              {suit.charAt(0).toUpperCase() + suit.slice(1)} Suit
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {archetypes.map((archetype) => (
                <Grid item xs={3} key={archetype.id}>
                  <ArchetypeCard
                    className={selectedArchetypes.includes(archetype.id) ? 'archetype-card-selected' : ''}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {archetype.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {archetype.faction}
                      </Typography>
                      <Box mt={2}>
                        <Typography variant="subtitle2" gutterBottom>
                          Abilities:
                        </Typography>
                        <Box>
                          <Typography variant="body2">
                            Level 1: {archetype.abilities?.level1 || 'TBD'}<br />
                            Level 3: {archetype.abilities?.level3 || 'TBD'}<br />
                            Level 5: {archetype.abilities?.level5 || 'TBD'}
                          </Typography>
                        </Box>
                      </Box>
                      <Box mt={2}>
                        <Typography variant="subtitle2" gutterBottom>
                          Bonus Skills:
                        </Typography>
                        <Box>
                          {Object.entries(archetype.bonusSkills).map(([type, skill]) => (
                            <Typography key={type} variant="body2">
                              {type}: {skill}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                      <Box mt={2}>
                        <Button
                          variant={selectedArchetypes.includes(archetype.id) ? 'contained' : 'outlined'}
                          fullWidth
                          onClick={() => handleArchetypeChange(suit, archetype)}
                        >
                          {selectedArchetypes.includes(archetype.id) ? 'Selected' : 'Select'}
                        </Button>
                      </Box>
                    </CardContent>
                  </ArchetypeCard>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Selected Archetypes
        </Typography>
        {selectedArchetypes.map(archetypeId => {
          const archetype = availableArchetypes?.find(a => a.id === archetypeId);
          return (
            <Typography key={archetypeId} variant="body2" sx={{ mb: 1 }}>
              {archetype?.name} ({archetype?.faction})
            </Typography>
          );
        })}
      </Box>
    </Box>
  );
};

export default ArchetypeSelection;
