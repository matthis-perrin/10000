import {Dice, DicePoolWithTaken, DiceCombination} from './models';

export const INITIAL_DICE_COUNT = 6;

export function randomDice(): Dice {
  return (Math.floor(Math.random() * 6) + 1) as Dice;
}

export function randomDicePool(poolSize: number): Dice[] {
  return [...new Array(poolSize)].map(() => randomDice()).sort();
}

function isStraight({dicePool, takenIndexes}: DicePoolWithTaken): boolean {
  return (
    takenIndexes.length === 0 &&
    dicePool[0] === 1 &&
    dicePool[1] === 2 &&
    dicePool[2] === 3 &&
    dicePool[3] === 4 &&
    dicePool[4] === 5 &&
    dicePool[5] === 6
  );
}

function isTriplePairs({dicePool, takenIndexes}: DicePoolWithTaken): boolean {
  return (
    takenIndexes.length === 0 &&
    dicePool[0] === dicePool[1] &&
    dicePool[2] === dicePool[3] &&
    dicePool[4] === dicePool[5]
  );
}

function consumeTripleIfPossible(
  dicePoolWithTaken: DicePoolWithTaken
): {dice: Dice; indexes: number[]} | undefined {
  const {dicePool, takenIndexes} = dicePoolWithTaken;
  if (dicePool.length - takenIndexes.length < 3) {
    return undefined;
  }
  const diceCounter = new Map<Dice, {count: number; indexes: number[]}>();
  for (let index = 0; index < dicePool.length; index++) {
    if (takenIndexes.includes(index)) {
      continue;
    }
    const dice = dicePool[index];
    const counter = diceCounter.get(dice);
    if (counter === undefined) {
      diceCounter.set(dice, {count: 1, indexes: [index]});
    } else {
      counter.count++;
      counter.indexes.push(index);
      if (counter.count === 3) {
        takenIndexes.push(...counter.indexes);
        return {dice, indexes: counter.indexes};
      }
    }
  }
  return undefined;
}

export function findTakeableDiceCombinations(
  dicePoolWithTakenInput: DicePoolWithTaken
): DiceCombination[] {
  const dicePoolWithTaken = {
    dicePool: dicePoolWithTakenInput.dicePool,
    takenIndexes: dicePoolWithTakenInput.takenIndexes.slice(),
  };
  if (isStraight(dicePoolWithTaken)) {
    return [{indexes: [0, 1, 2, 3, 4, 5], score: 1500}];
  }
  if (isTriplePairs(dicePoolWithTaken)) {
    return [{indexes: [0, 1, 2, 3, 4, 5], score: 1500}];
  }

  const combinations: DiceCombination[] = [];

  const triple = consumeTripleIfPossible(dicePoolWithTaken);
  if (triple !== undefined) {
    const {dice, indexes} = triple;
    combinations.push({indexes, score: dice === 1 ? 1000 : dice * 100});
    const tripleAgain = consumeTripleIfPossible(dicePoolWithTaken);
    if (tripleAgain !== undefined) {
      const {dice, indexes} = tripleAgain;
      combinations.push({indexes, score: dice === 1 ? 1000 : dice * 100});
    }
  }

  for (let index = 0; index < dicePoolWithTaken.dicePool.length; index++) {
    if (dicePoolWithTaken.takenIndexes.includes(index)) {
      continue;
    }
    const dice = dicePoolWithTaken.dicePool[index];
    if (dice === 1) {
      dicePoolWithTaken.takenIndexes.push(index);
      combinations.push({indexes: [index], score: 100});
    }
    if (dice === 5) {
      dicePoolWithTaken.takenIndexes.push(index);
      combinations.push({indexes: [index], score: 50});
    }
  }

  return combinations.sort(({score: s1}, {score: s2}) => s2 - s1);
}
