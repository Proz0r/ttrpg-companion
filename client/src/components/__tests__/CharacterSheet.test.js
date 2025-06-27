import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CharacterSheet from '../CharacterSheet';
import io from 'socket.io-client';

// Mock socket.io
jest.mock('socket.io-client', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    off: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn()
  }));
});

describe('CharacterSheet Component', () => {
  let socket;
  const mockSocket = {
    on: jest.fn(),
    emit: jest.fn(),
    off: jest.fn()
  };

  beforeEach(() => {
    socket = mockSocket;
    io.mockReturnValue(socket);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle 4-player mode correctly', async () => {
    render(<CharacterSheet />);

    // Set player count to 4
    const playerCountSelect = screen.getByLabelText(/player count/i);
    fireEvent.change(playerCountSelect, { target: { value: '4' } });

    // Create character
    const nameInput = screen.getByLabelText(/name/i);
    const raceInput = screen.getByLabelText(/race/i);
    const classInput = screen.getByLabelText(/class/i);
    const createButton = screen.getByText(/create character/i);

    fireEvent.change(nameInput, { target: { value: 'Test Character' } });
    fireEvent.change(raceInput, { target: { value: 'Human' } });
    fireEvent.change(classInput, { target: { value: 'Warrior' } });
    fireEvent.click(createButton);

    // Wait for character creation
    await waitFor(() => {
      expect(socket.emit).toHaveBeenCalledWith('characterCreated', expect.any(Object));
    });

    // Verify only one suit role can be selected
    const suitCheckboxes = screen.getAllByRole('checkbox');
    expect(suitCheckboxes.length).toBe(4); // Clubs, Diamonds, Hearts, Spades
    
    fireEvent.click(suitCheckboxes[0]); // Select Clubs
    expect(suitCheckboxes[1]).toBeDisabled();
    expect(suitCheckboxes[2]).toBeDisabled();
    expect(suitCheckboxes[3]).toBeDisabled();

    // Spend points
    const spendButton = screen.getByText('+1');
    fireEvent.click(spendButton);
    
    await waitFor(() => {
      expect(socket.emit).toHaveBeenCalledWith('characterUpdated', expect.any(Object));
    });

    // Level up
    const levelUpButton = screen.getByText(/level up/i);
    fireEvent.click(levelUpButton);
    
    await waitFor(() => {
      expect(socket.emit).toHaveBeenCalledWith('characterUpdated', expect.any(Object));
    });

    // Delete character
    const deleteButton = screen.getByText(/delete/i);
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(socket.emit).toHaveBeenCalledWith('characterDeleted', expect.any(String));
    });
  });

  it('should handle 2-player mode correctly', async () => {
    render(<CharacterSheet />);

    // Set player count to 2
    const playerCountSelect = screen.getByLabelText(/player count/i);
    fireEvent.change(playerCountSelect, { target: { value: '2' } });

    // Create character
    const nameInput = screen.getByLabelText(/name/i);
    const raceInput = screen.getByLabelText(/race/i);
    const classInput = screen.getByLabelText(/class/i);
    const createButton = screen.getByText(/create character/i);

    fireEvent.change(nameInput, { target: { value: 'Test Character' } });
    fireEvent.change(raceInput, { target: { value: 'Human' } });
    fireEvent.change(classInput, { target: { value: 'Warrior' } });
    fireEvent.click(createButton);

    // Wait for character creation
    await waitFor(() => {
      expect(socket.emit).toHaveBeenCalledWith('characterCreated', expect.any(Object));
    });

    // Verify only two suit roles can be selected
    const suitCheckboxes = screen.getAllByRole('checkbox');
    expect(suitCheckboxes.length).toBe(2); // Only Clubs and Diamonds
    
    fireEvent.click(suitCheckboxes[0]); // Select Clubs
    fireEvent.click(suitCheckboxes[1]); // Select Diamonds
    expect(suitCheckboxes[0]).toBeEnabled();
    expect(suitCheckboxes[1]).toBeEnabled();

    // Spend points on both suits
    const clubsSpendButton = screen.getByLabelText(/clubs/i).nextSibling;
    const diamondsSpendButton = screen.getByLabelText(/diamonds/i).nextSibling;
    
    fireEvent.click(clubsSpendButton);
    fireEvent.click(diamondsSpendButton);
    
    await waitFor(() => {
      expect(socket.emit).toHaveBeenCalledWith('characterUpdated', expect.any(Object));
    });

    // Level up
    const levelUpButton = screen.getByText(/level up/i);
    fireEvent.click(levelUpButton);
    
    await waitFor(() => {
      expect(socket.emit).toHaveBeenCalledWith('characterUpdated', expect.any(Object));
    });

    // Delete character
    const deleteButton = screen.getByText(/delete/i);
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(socket.emit).toHaveBeenCalledWith('characterDeleted', expect.any(String));
    });
  });

  it('should handle socket events correctly', async () => {
    render(<CharacterSheet />);

    // Test character creation event
    const mockCharacter = {
      id: '123',
      name: 'Test Character',
      race: 'Human',
      class: 'Warrior',
      level: 1,
      suitRoles: ['clubs'],
      attributes: {
        clubs: 2,
        diamonds: 0,
        hearts: 0,
        spades: 0
      }
    };

    socket.emit('characterCreated', mockCharacter);
    await waitFor(() => {
      expect(screen.getByText('Test Character')).toBeInTheDocument();
    });

    // Test character update event
    const updatedCharacter = {
      ...mockCharacter,
      level: 2,
      attributes: {
        clubs: 3,
        diamonds: 0,
        hearts: 0,
        spades: 0
      }
    };

    socket.emit('characterUpdated', updatedCharacter);
    await waitFor(() => {
      expect(screen.getByText('Level: 2')).toBeInTheDocument();
    });

    // Test character deletion event
    socket.emit('characterDeleted', '123');
    await waitFor(() => {
      expect(screen.queryByText('Test Character')).not.toBeInTheDocument();
    });
  });
});
