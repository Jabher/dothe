import * as Listr from 'listr'
import {Subject, scheduled, asapScheduler} from 'rxjs'
import {map, scan, mergeAll} from 'rxjs/operators'
import {argv} from 'yargs'
import {registry} from "../lib/TaskRegistry";
import {Task, TaskType} from "../lib/Task";
import {MapWithDefault} from "../lib/MapWithDefault";
import {Action} from "../lib/taskRunner";

const createDependenciesTask = (dependencies: Set<string>, resolutions: MapWithDefault<string, Subject<string>>): Listr.ListrTask<any> => {
    const waitForSting = (deps: Set<string> | string[]) => [...deps].length > 0
        ? `wait for ${[...deps].join(', ')}`
        : `resolved: ${[...dependencies].join(', ')}`
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
}

/*todo wrap child process*/
const wrapFn = (fn: Action, resolution: Subject<any>, isLast: boolean): () => Promise<any> => {
    if (isLast) {
        return async () => {
            await fn()
            resolution.next()
            resolution.complete()
        }
    } else {
        return async () => {
            await fn()
        }
    }
}

const createTask = (task: Task, dependencies: Set<string>, resolutions: MapWithDefault<string, Subject<string>>): Listr.ListrTask<any> => {
    const title = task.description ? `${task.name} (${task.description})` : task.name
    switch (task.type) {
        case TaskType.Empty:
            return {
                title,
                task: wrapFn(() => {}, resolutions.get(task.name), true)
            }
        case TaskType.Composite:
            return {
                title: `Composite: ${title}`,
                task: () => new Listr([
                    createDependenciesTask(dependencies, resolutions)
                ])
            }
        case TaskType.Functional:
            const dependenciesTasks = dependencies.size > 0 ? [createDependenciesTask(dependencies, resolutions)] : []
            const executionTasks = task.fns.map((fn, index, array) => ({
                title: fn.name ? `step ${index + 1}: ${fn.name}` : `step ${index + 1}`,
                task: wrapFn(fn, resolutions.get(task.name), index === array.length - 1)
            }))
            return {
                title,
                task: () => new Listr([
                    ...dependenciesTasks,
                    ...executionTasks
                ])
            }
    }
}

async function run(tasks: string[]) {
    const {nodes, taskDependencies} = registry.describe(tasks.length > 0 ? tasks : ['default'])
    const resolutions = new MapWithDefault((name: string) => new Subject().pipe(map(() => name)) as Subject<string>)

    const listr = new Listr([...nodes].map(task => createTask(registry.tasks.get(task) as Task, taskDependencies.get(task), resolutions)), {concurrent: true})
    await listr.run();
}

run(argv._).catch(error => console.log(error));
