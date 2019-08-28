import {argv} from 'yargs'
import {registeredTasks, taskNodeRegistry} from "../lib/global-state";
export const passedTasks = argv._.length > 0 ? argv._ : ['default'];

const unknownTasks = passedTasks.filter(task => !registeredTasks.has(task));

if (unknownTasks.length > 0) {
    console.error(`following tasks are not found: ${unknownTasks.join(', ')}`);
    console.log('cannot run your tasks due to problems above, exiting');
    process.exit(126); //Command invoked cannot execute
}


type Description = { [key: string]: string[] };

export const describe = (tasks: string[], dependencies: Description = {}): Description => {
    for (const task of tasks) {
        if (!dependencies[task]) {
            const taskDependencies = [...taskNodeRegistry.get(task).ancestors].map(({value}) => value);
            dependencies[task] = taskDependencies;
            Object.assign(dependencies,  describe(taskDependencies, dependencies));
        }
    }
    return dependencies;
};

export const tasks = describe(passedTasks);
