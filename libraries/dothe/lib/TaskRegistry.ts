import {Task} from "./Task";
import {DuplicateTaskError} from "./errors/DuplicateTaskError";
import {BadTaskNameError} from "./errors/BadTaskNameError";
import {DependencyRegistry} from "./DependencyRegistry";

export class TaskRegistry {
    static nameRegex = /^[a-zA-Z0-9-.:]+$/;

    static validateName(name: string) {
        if (!this.nameRegex.test(name)) {
            throw new BadTaskNameError(name);
        }
    }

    tasks = new Map<string, Task>();
    dependencies = new DependencyRegistry(this);

    registerTask(name: string): Task {
        if (this.tasks.has(name)) {
            throw new DuplicateTaskError(name);
        }
        TaskRegistry.validateName(name);
        const task = new Task(this, name);
        this.tasks.set(name, task);
        return task;
    }

    hasDependences(to: string): boolean {
        return this.dependencies.has(to);
    }

    registerDependency(from: string, to: string): void {
        this.dependencies.add(from, to)
    }

    describe(tasks: string[]) {
        return this.dependencies.toposort(...tasks);
    }
}

export const registry = new TaskRegistry()
