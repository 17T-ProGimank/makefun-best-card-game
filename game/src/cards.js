// Card database for Tidepool Tussle. Four families, told apart by colour AND glyph:
// wave (blue, droplet), shell (amber, shell), coral (rose, coral), kelp (green, leaf).
// Keywords: Swift — may attack the turn it is played. Splash — deals 1 to the enemy
// hero when the card is played.
const FAMILIES = {
  wave: { name: 'Wave', glyph: '🌊', css: 'fam-wave' },
  shell: { name: 'Shell', glyph: '🐚', css: 'fam-shell' },
  coral: { name: 'Coral', glyph: '🪸', css: 'fam-coral' },
  kelp: { name: 'Kelp', glyph: '🌿', css: 'fam-kelp' },
};

// id, name, family, art, cost (bubbles), attack, health, keyword ('' | 'Swift' | 'Splash')
const CARD_LIST = [
  { id: 'crab', name: 'Hermit Crab', family: 'shell', art: '🦀', cost: 1, atk: 1, hp: 3, keyword: '' },
  { id: 'plankton', name: 'Plankton Swarm', family: 'kelp', art: '✨', cost: 1, atk: 2, hp: 1, keyword: '' },
  { id: 'snail', name: 'Tide Snail', family: 'shell', art: '🐌', cost: 1, atk: 1, hp: 4, keyword: '' },
  { id: 'starfish', name: 'Starfish', family: 'wave', art: '⭐', cost: 2, atk: 2, hp: 3, keyword: '' },
  { id: 'clownfish', name: 'Clownfish', family: 'wave', art: '🐠', cost: 2, atk: 3, hp: 2, keyword: '' },
  { id: 'urchin', name: 'Sea Urchin', family: 'coral', art: '🔱', cost: 2, atk: 1, hp: 4, keyword: 'Splash' },
  { id: 'jelly', name: 'Jellyfish', family: 'coral', art: '🪼', cost: 3, atk: 3, hp: 3, keyword: 'Splash' },
  { id: 'octopus', name: 'Octopus', family: 'wave', art: '🐙', cost: 3, atk: 3, hp: 4, keyword: '' },
  { id: 'eel', name: 'Moray Eel', family: 'coral', art: '🐍', cost: 3, atk: 4, hp: 2, keyword: 'Swift' },
  { id: 'turtle', name: 'Sea Turtle', family: 'shell', art: '🐢', cost: 4, atk: 2, hp: 7, keyword: '' },
  { id: 'manta', name: 'Manta Ray', family: 'wave', art: '🦋', cost: 4, atk: 4, hp: 4, keyword: 'Swift' },
  { id: 'puffer', name: 'Pufferfish', family: 'coral', art: '🐡', cost: 4, atk: 3, hp: 5, keyword: 'Splash' },
  { id: 'clam', name: 'Giant Clam', family: 'shell', art: '🦪', cost: 5, atk: 3, hp: 8, keyword: '' },
  { id: 'shark', name: 'Shark', family: 'coral', art: '🦈', cost: 5, atk: 6, hp: 4, keyword: '' },
  { id: 'kraken', name: 'Kraken', family: 'wave', art: '🦑', cost: 6, atk: 7, hp: 7, keyword: '' },
  { id: 'golem', name: 'Coral Golem', family: 'coral', art: '🗿', cost: 6, atk: 5, hp: 8, keyword: '' },
];

const CARD_BY_ID = {};
for (const card of CARD_LIST) CARD_BY_ID[card.id] = card;

// The 24-card deck every side plays: two copies of the eight cheap creatures,
// one copy of each of the eight big ones.
const DECK_RECIPE = [
  'crab', 'crab', 'plankton', 'plankton', 'snail', 'snail', 'starfish', 'starfish',
  'clownfish', 'clownfish', 'urchin', 'urchin', 'jelly', 'jelly', 'octopus', 'octopus',
  'eel', 'turtle', 'manta', 'puffer', 'clam', 'shark', 'kraken', 'golem',
];

function buildDeck(rng) {
  return shuffleDeck(DECK_RECIPE, rng);
}

function makeCreature(cardId, uid) {
  const base = CARD_BY_ID[cardId];
  return {
    uid: uid,
    id: base.id,
    name: base.name,
    family: base.family,
    art: base.art,
    cost: base.cost,
    atk: base.atk,
    hp: base.hp,
    maxHp: base.hp,
    keyword: base.keyword,
    canAttack: base.keyword === 'Swift',
    justPlayed: true,
  };
}
