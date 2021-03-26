import {DiceCombination, Round, Strategy} from './models';
import {simulateStrategy} from './simulation';

const SIMULATION_COUNT = 1000 * 1000 * 4;

function chooseSingleBestCombinations(
  round: Round,
  combinations: DiceCombination[]
): DiceCombination[] {
  return [combinations[0]];
}
function chooseAllButFiveIfPossible(
  round: Round,
  combinations: DiceCombination[]
): DiceCombination[] {
  const betterThanWorse = combinations.filter(c => c.score > 50);
  return betterThanWorse.length > 0 ? betterThanWorse : [combinations[0]];
}
function chooseAllButFiveOrTripleTwoIfPossible(
  round: Round,
  combinations: DiceCombination[]
): DiceCombination[] {
  const betterThanWorse = combinations.filter(c => c.score > 50 && c.score !== 200);
  return betterThanWorse.length > 0 ? betterThanWorse : [combinations[0]];
}

const basicStrategy: Strategy = {
  chooseDiceCombinations: (round, combinations) =>
    round.roundCompleted.length > 0
      ? combinations // Take everything if we are at round #2
      : chooseSingleBestCombinations(round, combinations), // By default take only one combi
  shouldStop: round =>
    // Stop at round 2 or more if we've already taken at least one dice
    (round.roundCompleted.length > 0 && round.diceKeptCount > 0) ||
    // Stop at first round with:
    // - a score of 500 or more
    // OR
    // - a score of 200 or more with 2 dice left (or less)
    (round.roundCompleted.length === 0 &&
      (round.currentScore >= 500 || (round.diceKeptCount > 3 && round.currentScore >= 200))),
};

console.log(simulateStrategy(basicStrategy, SIMULATION_COUNT));

//
