import {Round, Strategy} from './models';
import {simulateStrategy} from './simulation';
import {chooseSingleBestCombinations} from './strategy';

const strategy: Strategy = {
  chooseDiceCombinations: (round, combinations) =>
    round.roundCompleted.length > 0 || // Round #2 reached
    combinations[0].score >= 200 || // We've got a combinaison
    round.diceKeptCount >= 4 || // We've thrown 3 dice or less
    round.totalScore >= 200
      ? combinations
      : chooseSingleBestCombinations(round, combinations),
  shouldStop: ({roundCompleted, diceKeptCount, currentScore}: Round) =>
    (roundCompleted.length > 0 && diceKeptCount > 1) ||
    (roundCompleted.length === 0 && (currentScore >= 450 || diceKeptCount >= 4)),
};

const floatArgs = process.argv.slice(2).map(param => parseFloat(param));
const rounds = floatArgs[0];
process.stdout.write(String(simulateStrategy(strategy, rounds).averageScore));
