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
  if (availableArchetypes && availableArchetypes.length > 0) {
    availableArchetypes.forEach(archetype => {
      const suit = archetype.suit;
      if (!archetypesBySuit[suit]) {
        archetypesBySuit[suit] = [];
      }
      archetypesBySuit[suit].push(archetype);
    });
  }

  const handleArchetypeChange = (archetype) => {
    setSelectedArchetypes(prev => {
      const newArchetypes = [...prev];
      const index = newArchetypes.indexOf(archetype.id);
      if (index !== -1) {
        newArchetypes.splice(index, 1);
      } else {
        // Only allow one archetype per suit
        newArchetypes = newArchetypes.filter(a => ARCHETYPES[a].suit !== archetype.suit);
        newArchetypes.push(archetype.id);
      }
      
      socket.emit('archetypeSelected', { suit: archetype.suit, archetypeId: archetype.id });
      return newArchetypes;
    });
  };

  const handleExpandChange = (suit) => (event, isExpanded) => {
    setExpandedSuits(prev => ({
      ...prev,
      [suit]: isExpanded,
    }));
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Select Your Archetypes
      </Typography>
      
      {Object.entries(archetypesBySuit).map(([suit, archetypes]) => (
        <Accordion key={suit} expanded={expandedSuits[suit]} onChange={handleExpandChange(suit)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{SUITS[suit].charAt(0).toUpperCase() + SUITS[suit].slice(1)}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {archetypes.map(archetype => (
                <Grid item xs={12} sm={6} key={archetype.id}>
                  <ArchetypeCard
                    className={selectedArchetypes.includes(archetype.id) ? 'archetype-card-selected' : ''}
                    onClick={() => handleArchetypeChange(archetype)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {archetype.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {archetype.faction}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {Object.values(archetype.abilities).join(', ')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Bonus Skills: {Object.values(archetype.bonusSkills).join(', ')}
                      </Typography>
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
