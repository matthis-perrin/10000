import {multiThreadedStrategy} from './simulation';

const SIMULATION_COUNT = 100 * 1000 * 1000;
console.log(`Running ${SIMULATION_COUNT.toLocaleString()} rounds`);
multiThreadedStrategy(SIMULATION_COUNT).then(console.log).catch(console.error);
