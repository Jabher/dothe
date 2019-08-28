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
        for (const task of dependencies) {
            encounteredTasks.get(task).push(`dependency of ${this.name}`);
            try {
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
