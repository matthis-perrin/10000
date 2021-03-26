import {Round, GameState, Strategy} from './models';
import {applyStrategy} from './strategy';

function initialRound(): Round {
  return {
    currentScore: 0,
    totalScore: 0,
    diceKeptCount: 0,
    roundCompleted: [],
  };
}

function initialGameState(): GameState {
  return {
    round: initialRound(),
    dicePoolWithTaken: {dicePool: [], takenIndexes: []},
  };
}

interface SimulationResult {
  durationMs: number;
  scores: number[];
  averageScore: number;
  best: number;
  bestGameState: GameState;
}

export function simulateStrategy(strategy: Strategy, rounds: number): SimulationResult {
  const t = Date.now();
  console.log(`Running ${rounds.toLocaleString()} rounds`);
  let sum: number = 0;
  let best = 0;
  let bestGameState = initialGameState();
  const scores: number[] = [];
  for (let index = 0; index < rounds; index++) {
    const gameState = initialGameState();
    const score = applyStrategy(strategy, gameState);
    sum += score;
    if (score > best) {
      bestGameState = gameState;
      best = score;
    }
    scores.push(score);
  }

  const durationMs = Date.now() - t;
  const averageScore = sum / scores.length;
  return {durationMs, scores, best, bestGameState, averageScore};
}

// export function debugStrategy(strategy: Strategy, rounds: number)