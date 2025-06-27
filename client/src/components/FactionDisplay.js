import React from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button
} from '@mui/material';
import { ARCHETYPES, FACTIONS } from '../data/gameData';

const FactionDisplay = ({ character }) => {
  // Get unique factions from selected archetypes
  const getFactions = () => {
    if (!character.archetypes) return [];
    
    const factionIds = character.archetypes.map(id => ARCHETYPES[id].faction);
    return [...new Set(factionIds)].map(factionId => FACTIONS[factionId]);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Factions
      </Typography>
      
      <Grid container spacing={2}>
        {getFactions().map(faction => (
          <Grid item xs={12} sm={6} md={4} key={faction.id}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={`/images/factions/${faction.id}.png`} // Add faction images
                alt={faction.name}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {faction.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {faction.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Display faction benefits */}
      <Box mt={2}>
        <Typography variant="subtitle1" gutterBottom>
          Faction Benefits
        </Typography>
        {getFactions().map(faction => (
          <Box key={faction.id}>
            <Typography variant="subtitle2" gutterBottom>
              {faction.name} Benefits:
            </Typography>
            <ul>
              {/* Add faction-specific benefits */}
              <li>Benefit 1</li>
              <li>Benefit 2</li>
              <li>Benefit 3</li>
            </ul>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default FactionDisplay;
