export interface GameState {
  round: Round;
  dicePoolWithTaken: DicePoolWithTaken;
}

export interface Round {
  currentScore: number;
  totalScore: number;
  diceKeptCount: number;
  roundCompleted: {score: number; dice: Dice[]}[];
}

export interface Strategy {
  shouldStop: (round: Round) => boolean;
  chooseDiceCombinations: (round: Round, combinations: DiceCombination[]) => DiceCombination[];
}

export type Dice = 1 | 2 | 3 | 4 | 5 | 6;

export interface DiceCombination {
  indexes: number[];
  score: number;
}

export interface DicePoolWithTaken {
  dicePool: Dice[];
  takenIndexes: number[];
}
