import {Round, DiceCombination} from './models';

export function chooseSingleBestCombinations(
  round: Round,
  combinations: DiceCombination[]
): DiceCombination[] {
  return [combinations[0]];
}

export function chooseAllButFiveIfPossible(
  round: Round,
  combinations: DiceCombination[]
): DiceCombination[] {
  const betterThanWorse = combinations.filter(c => c.score > 50);
  return betterThanWorse.length > 0 ? betterThanWorse : [combinations[0]];
}

export function chooseAllButFiveOrTripleTwoIfPossible(
  round: Round,
  combinations: DiceCombination[]
): DiceCombination[] {
  const betterThanWorse = combinations.filter(c => c.score > 50 && c.score !== 200);
  return betterThanWorse.length > 0 ? betterThanWorse : [combinations[0]];
}
