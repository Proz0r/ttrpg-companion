export const SUITS = {
  CLUBS: 'clubs',
  DIAMONDS: 'diamonds',
  HEARTS: 'hearts',
  SPADES: 'spades'
};

export const ARCHETYPES = {
  // Diamonds
  MAGE: {
    id: 'mage',
    name: 'Mage',
    suit: SUITS.DIAMONDS,
    faction: 'Arcane Academy',
    abilities: {
      level1: 'Arcane Bolt',
      level3: 'Mana Shield',
      level5: 'Arcane Mastery'
    },
    bonusSkills: {
      generic: 'Arcane Knowledge',
      suit: 'Spellcasting',
      other: 'Mystic Power'
    }
  },
  ENCHANTER: {
    id: 'enchanter',
    name: 'Enchanter',
    suit: SUITS.DIAMONDS,
    faction: 'Coven Circle',
    abilities: {
      level1: 'Enchanting',
      level3: 'Mystic Binding',
      level5: 'Powerful Enchantment'
    },
    bonusSkills: {
      generic: 'Mystic Knowledge',
      suit: 'Enchantment',
      other: 'Ritual Casting'
    }
  },
  INHERITOR: {
    id: 'inheritor',
    name: 'Inheritor',
    suit: SUITS.DIAMONDS,
    faction: 'Monster Mash',
    abilities: {
      level1: 'Monster Power',
      level3: 'Inheritance',
      level5: 'Monster Mastery'
    },
    bonusSkills: {
      generic: 'Monster Knowledge',
      suit: 'Monster Control',
      other: 'Monster Power'
    }
  },
  MEDIUM: {
    id: 'medium',
    name: 'Medium',
    suit: SUITS.DIAMONDS,
    faction: 'Undead Haunt',
    abilities: {
      level1: 'Spirit Contact',
      level3: 'Ghost Form',
      level5: 'Spirit Mastery'
    },
    bonusSkills: {
      generic: 'Spirit Knowledge',
      suit: 'Spirit Control',
      other: 'Ghost Power'
    }
  },

  // Hearts (Heavens, Outer Worlds, Hells, Twilight Realms)
  PRIEST: {
    id: 'priest',
    name: 'Priest',
    suit: SUITS.HEARTS,
    faction: 'Heavens',
    abilities: {
      level1: 'Healing Touch',
      level3: 'Restoration',
      level5: 'Divine Healing'
    },
    bonusSkills: {
      generic: 'Healing',
      suit: 'Medicine',
      other: 'Compassion'
    }
  },
  OCCULTIST: {
    id: 'occultist',
    name: 'Occultist',
    suit: SUITS.HEARTS,
    faction: 'Outer Worlds',
    abilities: {
      level1: 'Mystic Knowledge',
      level3: 'Otherworldly Power',
      level5: 'Dimensional Mastery'
    },
    bonusSkills: {
      generic: 'Mystic Knowledge',
      suit: 'Occult',
      other: 'Otherworldly Insight'
    }
  },
  DEMONIST: {
    id: 'demonist',
    name: 'Demonist',
    suit: SUITS.HEARTS,
    faction: 'Hells',
    abilities: {
      level1: 'Dark Magic',
      level3: 'Demonic Pact',
      level5: 'Hellfire'
    },
    bonusSkills: {
      generic: 'Dark Knowledge',
      suit: 'Demonology',
      other: 'Dark Power'
    }
  },
  BARD: {
    id: 'bard',
    name: 'Bard',
    suit: SUITS.HEARTS,
    faction: 'Twilight Realms',
    abilities: {
      level1: 'Performance',
      level3: 'Inspiration',
      level5: 'Master Performance'
    },
    bonusSkills: {
      generic: 'Performance',
      suit: 'Music',
      other: 'Inspiration'
    }
  },

  // Spades (Beasts, Extractors, Hunters, Nature Spirits)
  SHIFTER: {
    id: 'shifter',
    name: 'Shifter',
    suit: SUITS.SPADES,
    faction: 'Beasts',
    abilities: {
      level1: 'Beast Form',
      level3: 'Bestial Power',
      level5: 'Master Shifter'
    },
    bonusSkills: {
      generic: 'Shapeshifting',
      suit: 'Beast Form',
      other: 'Bestial Power'
    }
  },
  ROGUE: {
    id: 'rogue',
    name: 'Rogue',
    suit: SUITS.SPADES,
    faction: 'Extractors',
    abilities: {
      level1: 'Stealth',
      level3: 'Backstab',
      level5: 'Master of Shadows'
    },
    bonusSkills: {
      generic: 'Stealth',
      suit: 'Lockpicking',
      other: 'Sneak Attack'
    }
  },
  HUNTER: {
    id: 'hunter',
    name: 'Hunter',
    suit: SUITS.SPADES,
    faction: 'Hunters',
    abilities: {
      level1: 'Hunting',
      level3: 'Tracking',
      level5: 'Master Hunter'
    },
    bonusSkills: {
      generic: 'Hunting',
      suit: 'Tracking',
      other: 'Survival'
    }
  },
  DRUID: {
    id: 'druid',
    name: 'Druid',
    suit: SUITS.SPADES,
    faction: 'Nature Spirits',
    abilities: {
      level1: 'Nature Magic',
      level3: 'Animal Companion',
      level5: 'Nature Mastery'
    },
    bonusSkills: {
      generic: 'Nature Knowledge',
      suit: 'Nature Magic',
      other: 'Animal Handling'
    }
  }
};

export const FACTIONS = {
  'Countrymen': {
    id: 'countrymen',
    name: 'Countrymen',
    description: 'Warriors from the countryside',
    archetypes: ['warrior']
  },
  'Justice': {
    id: 'justice',
    name: 'Justice',
    description: 'Enforcers of law and order',
    archetypes: ['justicar']
  },
  'Nobility': {
    id: 'nobility',
    name: 'Nobility',
    description: 'Knights of the noble houses',
    archetypes: ['knight']
  },
  'Underground': {
    id: 'underground',
    name: 'Underground',
    description: 'Challengers of the status quo',
    archetypes: ['challenger']
  },
  'Arcane Academy': {
    id: 'arcane-academy',
    name: 'Arcane Academy',
    description: 'A prestigious institution of magical learning',
    archetypes: ['mage']
  },
  'Coven Circle': {
    id: 'coven-circle',
    name: 'Coven Circle',
    description: 'Mystic practitioners of enchantment',
    archetypes: ['enchanter']
  },
  'Monster Mash': {
    id: 'monster-mash',
    name: 'Monster Mash',
    description: 'Masters of monster powers',
    archetypes: ['inheritor']
  },
  'Undead Haunt': {
    id: 'undead-haunt',
    name: 'Undead Haunt',
    description: 'Masters of the undead',
    archetypes: ['medium']
  },
  'Heavens': {
    id: 'heavens',
    name: 'Heavens',
    description: 'Servants of the divine light',
    archetypes: ['priest']
  },
  'Outer Worlds': {
    id: 'outer-worlds',
    name: 'Outer Worlds',
    description: 'Masters of otherworldly knowledge',
    archetypes: ['occultist']
  },
  'Hells': {
    id: 'hells',
    name: 'Hells',
    description: 'Wielders of dark power',
    archetypes: ['demonist']
  },
  'Twilight Realms': {
    id: 'twilight-realms',
    name: 'Twilight Realms',
    description: 'Masters of inspiration and performance',
    archetypes: ['bard']
  },
  'Beasts': {
    id: 'beasts',
    name: 'Beasts',
    description: 'Masters of shapeshifting',
    archetypes: ['shifter']
  },
  'Extractors': {
    id: 'extractors',
    name: 'Extractors',
    description: 'Masters of stealth and extraction',
    archetypes: ['rogue']
  },
  'Hunters': {
    id: 'hunters',
    name: 'Hunters',
    description: 'Trackers of the wild',
    archetypes: ['hunter']
  },
  'Nature Spirits': {
    id: 'nature-spirits',
    name: 'Nature Spirits',
    description: 'Guardians of the natural world',
    archetypes: ['druid']
  }
};

export const GENERIC_SKILLS = [
  'Arcane Knowledge',
  'Mystic Knowledge',
  'Combat Training',
  'Stealth',
  'Survival',
  // Add remaining generic skills
];

export const SUIT_SKILLS = {
  [SUITS.CLUBS]: [
    'Spellcasting',
    'Enchantment',
    'Arcane Power',
    'Mystic Binding'
  ],
  [SUITS.DIAMONDS]: [
    'Diplomacy',
    'Leadership',
    'Negotiation',
    'Charisma'
  ],
  // Add skills for other suits
};

export const MAX_ATTRIBUTE_POINTS = {
  level1: 3,
  level2: 4,
  level4: 5
};

export const SKILL_POINTS_PER_ATTRIBUTE = 1;

// Helper functions
export const getAvailableArchetypes = (suitRoles) => {
  return Object.values(ARCHETYPES).filter(archetype => 
    suitRoles.includes(archetype.suit)
  );
};

export const getAvailableSkills = (suit) => {
  return [...GENERIC_SKILLS, ...SUIT_SKILLS[suit]];
};
