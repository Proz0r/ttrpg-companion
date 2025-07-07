import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  Grid
} from '@mui/material';

const BasicInfo = ({ onNext }) => {
  const fields = [
    { name: 'name', label: 'Name' },
    { name: 'race', label: 'Race' },
    { name: 'background', label: 'Background' },
    { name: 'appearance', label: 'Appearance' },
    { name: 'personality', label: 'Personality' },
    { name: 'backstory', label: 'Backstory', multiline: true, rows: 4 }
  ];

  const [formData, setFormData] = useState(fields.reduce((acc, field) => {
    acc[field.name] = '';
    return acc;
  }, {}));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Basic Information
      </Typography>
      <Grid container spacing={3}>
        {fields.map((field) => (
          <Grid item xs={12} key={field.name}>
            <TextField
              fullWidth
              label={field.label}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              multiline={field.multiline}
              rows={field.rows}
            />
          </Grid>
        ))}
      </Grid>
      <Button
        variant="contained"
        onClick={() => onNext(formData)}
        sx={{ mt: 3 }}
      >
        Next
      </Button>
    </Box>
  );
};

export default BasicInfo;
