import * as Listr from 'listr'
import {MapWithDefault} from "collections-plus";
import {Subject, scheduled, asapScheduler} from 'rxjs'
import {map, scan, mergeAll} from 'rxjs/operators'
import {argv} from 'yargs'
import {Action} from "../../lib/taskRunner";
import {registeredTasks, taskDescriptions, taskNodeRegistry} from "../../lib/global-state";

const createDependenciesTask = (dependencies: Set<string>, resolutions: MapWithDefault<string, Subject<string>>): Listr.ListrTask<any> => {
    const waitForSting = (deps: Set<string> | string[]) => [...deps].length > 0
        ? `wait for ${[...deps].join(', ')}`
        : `resolved: ${[...dependencies].join(', ')}`;

    return {
        title: waitForSting(dependencies),
        task: () =>
            scheduled([...dependencies].map(name => resolutions.get(name)), asapScheduler)
                .pipe(
                    mergeAll(),
                    scan((acc, name) => {
                        acc.delete(name);
                        return acc;
                    }, new Set(dependencies)),
                    map(waitForSting)
                )
    }
};

/*todo wrap to child process and log to file*/
const wrapFn = (fn: Action, resolution: Subject<any>, isLast: boolean): () => Promise<any> => {
    if (isLast) {
        return async () => {
            await fn();
            resolution.next();
            resolution.complete();
        }
    } else {
        return async () => {
            await fn()
        }
    }
};
const makeTask = (title: string, ...task: ReadonlyArray<Listr.ListrTask<any>>) => ({
    title,
    task: () => new Listr(task)
});

const createTask = (taskName: string, dependencies: Set<string>, resolutions: MapWithDefault<string, Subject<string>>): Listr.ListrTask<any> => {
    const description = taskDescriptions.get(taskName);
    const title = description ? `${taskName} (${description})` : taskName;
    const task = registeredTasks.get(taskName)!;
    if (task.fns) {
        const dependenciesTasks = dependencies.size > 0 ? [createDependenciesTask(dependencies, resolutions)] : [];
        const getStepName = (index: number) => task.fns.length > 1 ? `step ${index + 1}` : `task`;
        const executionTasks = task.fns.map((fn, index, array) => ({
            title: fn.name ? `${getStepName(index)}: ${fn.name}` : getStepName(index),
            task: wrapFn(fn, resolutions.get(task.name), index === array.length - 1)
        }));
        return makeTask(title, ...dependenciesTasks, ...executionTasks)
    } else {
        return makeTask(`Composite: ${title}`, createDependenciesTask(dependencies, resolutions))
    }
};

type Description = { tasks: Set<string>, dependencies: MapWithDefault<string, Set<string>> };

const describe = (tasks: string[], description: Description = {
    tasks: new Set(),
    dependencies: new MapWithDefault(() => new Set())
}): Description => {
    for (const task of tasks) {
        if (!description.tasks.has(task)) {
            description.tasks.add(task);
            description = describe([...taskNodeRegistry.get(task).ancestors].map(node => node.value), description);
        }
    }
    return description;
};

async function run(_tasks: string[]) {
    const tasks = _tasks.length > 0 ? _tasks : ['default'];
    const unknownTasks = tasks.filter(task => !registeredTasks.has(task));
    if (unknownTasks.length > 0) {
        console.error(`following tasks are not found: ${unknownTasks.join(', ')}`)
    }

    const {tasks: allTasks, dependencies} = describe(tasks);
    const resolutions = new MapWithDefault((name: string) => new Subject().pipe(map(() => name)) as Subject<string>);

    const listr = new Listr([...allTasks].map(task => createTask(task, dependencies.get(task), resolutions)), {concurrent: true});
    await listr.run();
}

run(argv._).catch(error => {
    console.log(error);
    process.exit(1);
});
