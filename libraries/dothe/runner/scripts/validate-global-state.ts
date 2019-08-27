import * as R from 'ramda'
import {discoveredCyclicDependencies, encounteredTasks, registeredTasks} from "../../lib/global-state";

let hasProblems = false;
const unknownTasks = [...encounteredTasks.entries()].filter(([name]) => !registeredTasks.has(name));

if (unknownTasks.length > 0) {
    hasProblems = true;
    console.log(`following tasks are unknown:`);
    for (const [task, reasons] of unknownTasks) {
        console.log(`${task} (${reasons.join(', ')})`)
    }
}
if (discoveredCyclicDependencies.size > 0) {
    console.log(`${hasProblems ? 'also, ' : ''}following cyclic dependencies were found:`);
    hasProblems = true;
    const chains = R.unnest([...discoveredCyclicDependencies].map(error => [...error.chains]));
    for (const chain of R.uniq(chains)) {
        console.log(chain.map(node => node.value).join(' -> '))
    }
}
if (hasProblems) {
    console.log('cannot run your tasks due to problems above, exiting');
    process.exit(126); //Command invoked cannot execute
}
