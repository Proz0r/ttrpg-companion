const CHARACTER_STORAGE_KEY = 'ttrpg_characters';

export const saveCharacter = (character, slot) => {
  const characters = loadCharacters();
  
  // Find the character in the slot
  const characterIndex = characters.findIndex(c => String(c.slot) === String(slot));
  
  if (characterIndex !== -1) {
    // Update existing character
    characters[characterIndex] = { ...character, slot };
  } else {
    // Add new character
    characters.push({ ...character, slot });
  }
  
  // Ensure characters are sorted by slot number
  characters.sort((a, b) => parseInt(a.slot) - parseInt(b.slot));
  
  localStorage.setItem(CHARACTER_STORAGE_KEY, JSON.stringify(characters));
};

export const loadCharacters = () => {
  const storedCharacters = localStorage.getItem(CHARACTER_STORAGE_KEY);
  return storedCharacters ? JSON.parse(storedCharacters) : [];
};

export const getCharacterBySlot = (slot) => {
  const characters = loadCharacters();
  return characters.find(c => String(c.slot) === String(slot));
};

export const clearCharacterSlot = (slot) => {
  const characters = loadCharacters();
  const updatedCharacters = characters.filter(c => String(c.slot) !== String(slot));
  localStorage.setItem(CHARACTER_STORAGE_KEY, JSON.stringify(updatedCharacters));
};

export const removeCharacterBySlot = (slot) => {
  clearCharacterSlot(slot);
};

export const updateCharacterBySlot = (slot, updates) => {
  const characters = loadCharacters();
  const characterIndex = characters.findIndex(c => String(c.slot) === String(slot));
  
  if (characterIndex !== -1) {
    characters[characterIndex] = { ...characters[characterIndex], ...updates };
    localStorage.setItem(CHARACTER_STORAGE_KEY, JSON.stringify(characters));
  }
};

export const getAvailableSlots = () => {
  const characters = loadCharacters();
  const usedSlots = new Set(characters.map(c => c.slot));
  return Array.from({ length: 8 }, (_, i) => i + 1)
    .filter(slot => !usedSlots.has(slot.toString()));
};

export const getCharacterSlot = (characterId) => {
  const characters = loadCharacters();
  return characters.find(c => c.id === characterId)?.slot;
};
