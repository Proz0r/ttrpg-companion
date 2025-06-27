import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import { ARCHETYPES, getAvailableArchetypes } from '../data/gameData';

type ArchetypeSelectionProps = {
  selectedArchetypes: string[];
  setSelectedArchetypes: (archetypes: string[]) => void;
  suitRoles: string[];
};

const ArchetypeSelection: React.FC<ArchetypeSelectionProps> = ({ selectedArchetypes, setSelectedArchetypes, suitRoles }) => {
  const [availableArchetypes, setAvailableArchetypes] = useState([]);

  useEffect(() => {
    if (!suitRoles) return;
    const filteredArchetypes = getAvailableArchetypes(suitRoles);
    setAvailableArchetypes(filteredArchetypes);
  }, [suitRoles]);

  const handleArchetypeChange = (suit, archetype) => {
    setSelectedArchetypes(prev => {
      const newArchetypes = [...prev];
      const index = newArchetypes.findIndex(a => ARCHETYPES[a]?.suit === suit);
      if (index !== -1) {
        newArchetypes[index] = archetype.id;
      } else {
        newArchetypes.push(archetype.id);
      }
      return newArchetypes;
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Available Archetypes
      </Typography>
      
      {availableArchetypes.map(archetype => (
        <Card key={archetype.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {archetype.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Faction: {archetype.faction}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Abilities:
              </Typography>
              <Typography variant="body2">
                Level 1: {archetype.abilities?.level1 || 'TBD'}<br />
                Level 3: {archetype.abilities?.level3 || 'TBD'}<br />
                Level 5: {archetype.abilities?.level5 || 'TBD'}
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Bonus Skills:
              </Typography>
              <Typography variant="body2">
                {Object.entries(archetype.bonusSkills).map(([skill, value]) => (
                  <span key={skill}>{skill}: +{value}<br /></span>
                ))}
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleArchetypeChange(archetype.suit, archetype)}
                disabled={selectedArchetypes.includes(archetype.id)}
              >
                {selectedArchetypes.includes(archetype.id) ? 'Selected' : 'Select'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      ))}
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Selected Archetypes
        </Typography>
        {selectedArchetypes.length > 0 ? (
          <Box>
            {selectedArchetypes.map(archetypeId => {
              const archetype = availableArchetypes.find(a => a.id === archetypeId);
              return (
                <Typography key={archetypeId} variant="body2" sx={{ mb: 1 }}>
                  {archetype?.name} ({archetype?.faction})
                </Typography>
              );
            })}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No archetypes selected
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ArchetypeSelection;
