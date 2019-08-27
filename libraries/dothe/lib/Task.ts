import {Action} from "./taskRunner";
import {
    discoveredCyclicDependencies,
    encounteredTasks,
    registeredTasks,
    taskNodeRegistry,
} from "./global-state";
import {CycleError} from "dagraph";
import {DuplicateTaskError} from "./errors/DuplicateTaskError";

export class Task {
    public fns: Action[] = [];
    public description?: string;


    constructor(public name: string) {
        if (registeredTasks.has(name)) {
            throw new DuplicateTaskError(name);
        }
        registeredTasks.set(name, this);
    }

    public defineActions(actions: Action[]): void {
        this.fns = actions;
    }

    public defineDependencies(dependencies: string[]): void {
        console.log('add ancestors', this.name, ...dependencies);
        for (const task of dependencies) {
            encounteredTasks.get(task).push(`dependency of ${this.name}`);
            try {
                console.log('add ancestor', this.name, task);
                taskNodeRegistry.get(this.name).addAncestor(taskNodeRegistry.get(task));
            } catch (error) {
                if (error instanceof CycleError) {
                    discoveredCyclicDependencies.add(error);
                } else {
                    throw error;
                }
            }
        }
    }
}
