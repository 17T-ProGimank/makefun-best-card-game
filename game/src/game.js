// Game state and rules for Tidepool Tussle.
// A side: { tide, maxTide, deck, hand, board, bubbles, maxBubbles }.
// A game: { seed, rng, player, enemy, turn, phase, winner, log, stats, uidCounter }.
// phase: 'title' | 'playing' | 'won' | 'lost'. turn: 'player' | 'enemy'.

const START_TIDE = 20;
const MAX_BOARD = 5;
const MAX_HAND = 7;
const MAX_BUBBLES = 8;
const OPENING_HAND = 3;

function makeSide(rng) {
  return {
    tide: START_TIDE,
    maxTide: START_TIDE,
    deck: buildDeck(rng),
    hand: [],
    board: [],
    bubbles: 0,
    maxBubbles: 0,
    fatigue: 0,
  };
}

function createGame(seed) {
  const rng = makeRng(seed);
  const game = {
    seed: seed,
    rng: rng,
    player: makeSide(rng),
    enemy: makeSide(rng),
    turn: 1,
    phase: 'title',
    active: 'player',
    winner: null,
    log: [],
    stats: { turns: 0, played: 0, damageDealt: 0, killed: 0 },
    uidCounter: 1,
  };
  for (let i = 0; i < OPENING_HAND; i++) {
    drawCard(game, game.player);
    drawCard(game, game.enemy);
  }
  return game;
}

function addLog(game, text) {
  game.log.unshift(text);
  if (game.log.length > 5) game.log.length = 5;
}

function drawCard(game, side) {
  if (side.deck.length === 0) {
    // Fatigue: an empty deck claims 1 Tide, then 2, then 3, and so on,
    // so no game can stall forever once both decks run dry.
    side.fatigue += 1;
    const who = side === game.player ? 'you' : 'Pell';
    dealHeroDamage(game, side, side.fatigue, 'The deep claims ' + side.fatigue + ' Tide from ' + who + ' — empty deck.');
    return null;
  }
  const id = side.deck.pop();
  if (side.hand.length >= MAX_HAND) return null;
  side.hand.push(id);
  return id;
}

function startPlayerTurn(game) {
  const side = game.player;
  side.maxBubbles = Math.min(MAX_BUBBLES, game.turn);
  side.bubbles = side.maxBubbles;
  for (const creature of side.board) creature.canAttack = true;
  drawCard(game, side);
  game.active = 'player';
  game.stats.turns = game.turn;
  addLog(game, 'Turn ' + game.turn + ' — your move. +' + side.maxBubbles + ' bubbles.');
}

function canPlayCard(game, handIndex) {
  if (game.phase !== 'playing' || game.active !== 'player') return false;
  const side = game.player;
  if (handIndex < 0 || handIndex >= side.hand.length) return false;
  if (side.board.length >= MAX_BOARD) return false;
  return side.bubbles >= CARD_BY_ID[side.hand[handIndex]].cost;
}

function playCard(game, handIndex) {
  if (!canPlayCard(game, handIndex)) return false;
  const side = game.player;
  const id = side.hand.splice(handIndex, 1)[0];
  const base = CARD_BY_ID[id];
  side.bubbles -= base.cost;
  const creature = makeCreature(id, game.uidCounter++);
  creature.justPlayed = true;
  side.board.push(creature);
  game.stats.played += 1;
  addLog(game, 'You play ' + base.name + ' (' + base.atk + '/' + base.hp + ').');
  if (base.keyword === 'Splash') {
    dealHeroDamage(game, game.enemy, 1, base.name + ' splashes Pell for 1.');
  }
  return true;
}

function enemyPlayCard(game, handIndex) {
  const side = game.enemy;
  const id = side.hand.splice(handIndex, 1)[0];
  const base = CARD_BY_ID[id];
  side.bubbles -= base.cost;
  const creature = makeCreature(id, game.uidCounter++);
  creature.justPlayed = true;
  side.board.push(creature);
  addLog(game, 'Pell plays ' + base.name + ' (' + base.atk + '/' + base.hp + ').');
  if (base.keyword === 'Splash') {
    dealHeroDamage(game, game.player, 1, base.name + ' splashes you for 1.');
  }
}

function dealHeroDamage(game, side, amount, logText) {
  side.tide = Math.max(0, side.tide - amount);
  if (logText) addLog(game, logText);
  if (side === game.player) game.stats.damageTaken = (game.stats.damageTaken || 0) + amount;
  else game.stats.damageDealt += amount;
  checkEnd(game);
}

function attackCreature(game, attackerSide, attacker, targetSide, target) {
  target.hp -= attacker.atk;
  attacker.hp -= target.atk;
  attacker.canAttack = false;
  addLog(game, attacker.name + ' hits ' + target.name + ' for ' + attacker.atk + '.');
  if (target.hp <= 0) {
    removeCreature(targetSide, target);
    addLog(game, target.name + ' sinks to the deep.');
    if (attackerSide === game.player) game.stats.killed += 1;
  }
  if (attacker.hp <= 0) {
    removeCreature(attackerSide, attacker);
    addLog(game, attacker.name + ' sinks to the deep.');
  }
  checkEnd(game);
}

function attackHero(game, attackerSide, attacker, targetSide) {
  targetSide.tide = Math.max(0, targetSide.tide - attacker.atk);
  attacker.canAttack = false;
  const who = attackerSide === game.player ? 'You hit Pell' : 'Pell hits you';
  addLog(game, who + ' for ' + attacker.atk + ' with ' + attacker.name + '.');
  if (attackerSide === game.player) game.stats.damageDealt += attacker.atk;
  checkEnd(game);
}

function removeCreature(side, creature) {
  const i = side.board.indexOf(creature);
  if (i >= 0) side.board.splice(i, 1);
}

function checkEnd(game) {
  if (game.phase !== 'playing') return;
  if (game.enemy.tide <= 0) {
    game.phase = 'won';
    game.winner = 'player';
    addLog(game, 'Pell\u2019s tide runs dry — you win!');
  } else if (game.player.tide <= 0) {
    game.phase = 'lost';
    game.winner = 'enemy';
    addLog(game, 'Your tide runs dry — Pell wins.');
  }
}

function endPlayerTurn(game) {
  if (game.phase !== 'playing' || game.active !== 'player') return;
  game.active = 'enemy';
  const side = game.enemy;
  side.maxBubbles = Math.min(MAX_BUBBLES, game.turn);
  side.bubbles = side.maxBubbles;
  for (const creature of side.board) creature.canAttack = true;
  drawCard(game, side);
  takeAiTurn(game);
  if (game.phase !== 'playing') return;
  game.turn += 1;
  startPlayerTurn(game);
}
