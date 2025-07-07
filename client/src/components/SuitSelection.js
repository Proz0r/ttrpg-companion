import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { SUITS } from '../data/gameData';

const SuitSelection = ({ onNext }) => {
  const [selectedSuits, setSelectedSuits] = useState([]);

  const handleSuitChange = (suit) => {
    setSelectedSuits(prev => {
      if (prev.includes(suit)) {
        return prev.filter(s => s !== suit);
      }
      return [...prev, suit];
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Suit Selection
      </Typography>
      <Grid container spacing={3}>
        {SUITS.map((suit) => (
          <Grid item xs={12} sm={6} md={4} key={suit}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {suit}
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedSuits.includes(suit)}
                      onChange={() => handleSuitChange(suit)}
                    />
                  }
                  label={`Select ${suit}`}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Button
        variant="contained"
        onClick={() => onNext(selectedSuits)}
        sx={{ mt: 3 }}
        disabled={selectedSuits.length === 0}
      >
        Next
      </Button>
    </Box>
  );
};

export default SuitSelection;
