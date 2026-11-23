// Deterministic staged states for screenshots: ?shot=title|play|win|loss&seed=7.
// Each stage builds a real game state (no fake pixels) so the screenshots are
// true renders of the game's own code.
function stageShot(game, shot) {
  if (shot === 'title') {
    game.phase = 'title';
    addLog(game, 'Welcome to the tidepools. Press Start to begin.');
    return;
  }
  if (shot === 'play') {
    stageMidGame(game);
    return;
  }
  if (shot === 'win') {
    stageEndGame(game, true);
    return;
  }
  if (shot === 'loss') {
    stageEndGame(game, false);
    return;
  }
  game.phase = 'title';
}

function stageMidGame(game) {
  game.phase = 'playing';
  game.active = 'player';
  game.turn = 4;
  game.player.maxBubbles = 4;
  game.player.bubbles = 2;
  game.player.tide = 17;
  game.enemy.maxBubbles = 4;
  game.enemy.bubbles = 1;
  game.enemy.tide = 14;
  // Trim decks so the counts read like turn 4.
  game.player.deck.length = 17;
  game.enemy.deck.length = 17;
  game.player.hand = ['shark', 'crab', 'urchin', 'clownfish', 'puffer'];
  game.enemy.hand = ['eel', 'turtle', 'jelly', 'starfish'];
  game.player.board = [
    makeCreature('octopus', 101),
    makeCreature('starfish', 102),
    makeCreature('manta', 103),
  ];
  game.player.board[0].canAttack = true;
  game.player.board[0].justPlayed = false;
  game.player.board[1].canAttack = true;
  game.player.board[1].justPlayed = false;
  game.player.board[2].canAttack = false;
  game.player.board[2].justPlayed = true;
  game.enemy.board = [makeCreature('turtle', 201), makeCreature('jelly', 202)];
  game.enemy.board[0].canAttack = false;
  game.enemy.board[0].justPlayed = false;
  game.enemy.board[1].canAttack = false;
  game.enemy.board[1].justPlayed = false;
  game.log = [
    'Pell plays Jellyfish (3/3).',
    'Your Manta Ray arrives — Swift, ready to strike.',
    'You play Octopus (3/4).',
    'Turn 4 — your move. +4 bubbles.',
    'Pell ends his turn.',
  ];
  game.stats.turns = 4;
  game.stats.played = 5;
  game.stats.damageDealt = 6;
  game.stats.killed = 1;
}

function stageEndGame(game, won) {
  game.phase = won ? 'won' : 'lost';
  game.winner = won ? 'player' : 'enemy';
  game.turn = 9;
  game.player.maxBubbles = 8;
  game.player.bubbles = won ? 3 : 0;
  game.enemy.maxBubbles = 8;
  game.enemy.bubbles = won ? 0 : 5;
  game.player.tide = won ? 11 : 0;
  game.enemy.tide = won ? 0 : 9;
  game.player.deck.length = 9;
  game.enemy.deck.length = 10;
  game.player.hand = won ? ['kraken', 'eel'] : ['snail'];
  game.enemy.hand = won ? ['snail'] : ['kraken', 'shark'];
  game.player.board = won
    ? [makeCreature('kraken', 301), makeCreature('shark', 302)]
    : [makeCreature('turtle', 303)];
  game.enemy.board = won
    ? []
    : [makeCreature('kraken', 304), makeCreature('shark', 305)];
  for (const c of game.player.board.concat(game.enemy.board)) {
    c.canAttack = false;
    c.justPlayed = false;
  }
  game.log = won
    ? [
        'Your Kraken hits Pell for 7.',
        'Pell\u2019s tide runs dry — you win!',
        'You play Kraken (7/7).',
        'Turn 9 — your move. +8 bubbles.',
        'Pell ends his turn.',
      ]
    : [
        'Pell\u2019s Kraken hits you for 7.',
        'Your tide runs dry — Pell wins.',
        'Pell plays Kraken (7/7).',
        'Turn 9 — your move. +8 bubbles.',
        'You play Sea Turtle (2/7).',
      ];
  game.stats.turns = 9;
  game.stats.played = won ? 11 : 9;
  game.stats.damageDealt = won ? 20 : 11;
  game.stats.killed = won ? 6 : 4;
}
