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
import { ITEMS } from '../data/gameData';

const ItemSelection = ({ onNext }) => {
  const [selectedItems, setSelectedItems] = useState([]);

  const handleItemChange = (item) => {
    setSelectedItems(prev => {
      if (prev.includes(item)) {
        return prev.filter(i => i !== item);
      }
      return [...prev, item];
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Item Selection
      </Typography>
      <Grid container spacing={3}>
        {Object.entries(ITEMS).map(([itemName, item]) => (
          <Grid item xs={12} sm={6} md={4} key={itemName}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {item.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {item.description}
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedItems.includes(itemName)}
                      onChange={() => handleItemChange(itemName)}
                    />
                  }
                  label={`Select ${item.name}`}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Button
        variant="contained"
        onClick={() => onNext(selectedItems)}
        sx={{ mt: 3 }}
        disabled={selectedItems.length === 0}
      >
        Next
      </Button>
    </Box>
  );
};

export default ItemSelection;
