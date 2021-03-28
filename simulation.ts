import {cpus} from 'os';
import {exec} from 'child_process';

import {Round, GameState, Strategy} from './models';
import {INITIAL_DICE_COUNT, randomDice, findTakeableDiceCombinations} from './dice';

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

export function applyStrategy(strategy: Strategy, gameState: GameState): number {
  // Generate new dice if not already taken
  const {round, dicePoolWithTaken} = gameState;
  for (let index = 0; index < INITIAL_DICE_COUNT; index++) {
    if (!dicePoolWithTaken.takenIndexes.includes(index)) {
      dicePoolWithTaken.dicePool[index] = randomDice();
    }
  }

  // Find the different combinaison of dice that can be taken
  const takeableCombinations = findTakeableDiceCombinations(dicePoolWithTaken);
  if (takeableCombinations.length === 0) {
    return 0;
  }

  // Apply the dice selection strategy
  const kept = strategy.chooseDiceCombinations(round, takeableCombinations);
  if (kept.length === 0) {
    throw new Error(`Strategy ${JSON.stringify(strategy)} didnt choose anything`);
  }

  // Update round info and dice pool
  for (const {indexes, score} of kept) {
    round.currentScore += score;
    round.totalScore += score;
    round.diceKeptCount += indexes.length;
    dicePoolWithTaken.takenIndexes.push(...indexes);
  }

  // Handle case when round is completed
  if (round.diceKeptCount === INITIAL_DICE_COUNT) {
    round.roundCompleted.push({
      dice: dicePoolWithTaken.takenIndexes.map(i => dicePoolWithTaken.dicePool[i]),
      score: round.currentScore,
    });
    round.diceKeptCount = 0;
    dicePoolWithTaken.takenIndexes = [];
  }

  // Sanity and data consistency check
  if (
    round.diceKeptCount > INITIAL_DICE_COUNT ||
    round.diceKeptCount !== dicePoolWithTaken.takenIndexes.length
  ) {
    const roundStr = JSON.stringify(round, undefined, 2);
    const dicePoolWithTakenStr = JSON.stringify(dicePoolWithTaken, undefined, 2);
    throw new Error(
      `Inconsistency in models:\nround:\n${roundStr}\ndicePoolWithTaken\n${dicePoolWithTakenStr}`
    );
  }

  // Ask the strategy to decide if we should continue throwing dice or stopping
  const shouldStop = strategy.shouldStop(round);
  if (shouldStop) {
    // If the strategy wants to stop, grab all the combinaison possible to maximize the score
    for (const {indexes, score} of findTakeableDiceCombinations(dicePoolWithTaken)) {
      round.currentScore += score;
      dicePoolWithTaken.takenIndexes.push(...indexes);
    }
    round.roundCompleted.push({
      dice: dicePoolWithTaken.takenIndexes.map(i => dicePoolWithTaken.dicePool[i]),
      score: round.currentScore,
    });

    // Done! Return the total score
    return round.totalScore;
  }

  // If we continue, recursive call
  return applyStrategy(strategy, gameState);
}

const PROCESS_COUNT = cpus().length;

export async function multiThreadedStrategy(rounds: number): Promise<number> {
  const results = await Promise.all(
    [...new Array(PROCESS_COUNT)].map(
      (_, i) =>
        new Promise<number>((resolve, reject) => {
          exec(
            // `./node_modules/.bin/ts-node process.ts ${Math.floor(rounds / PROCESS_COUNT)}`,
            `node process.js ${Math.floor(rounds / PROCESS_COUNT)}`,
            (err, stdout, stderr) => {
              return err ? reject(stderr) : resolve(parseFloat(stdout));
            }
          );
        })
    )
  );
  return results.reduce((sum, val) => sum + val, 0) / PROCESS_COUNT;
}
