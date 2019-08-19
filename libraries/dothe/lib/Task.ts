import {stringifyTemplate} from "./stringifyTemplate";
import {TaskRegistry} from "./TaskRegistry";
import {Action} from "./taskRunner";
import {ImpossibleStateError} from "./errors/ImpossibleStateError";

export enum TaskType {
    Empty,
    Composite,
    Functional
}

const checkArrayTypes = <Expected>(expectedType: string, values: Array<any | Expected>): values is Expected[] => {
    for (const task of values) {
        // noinspection SuspiciousTypeOfGuard - looks like false positive
        if (typeof task !== expectedType) {
            throw new TypeError(`expected ${expectedType}; instead got ${task}`)
        }
    }
    return true;
}

export class Task {
    static taskTypes = TaskType
    public type = TaskType.Empty
    public fns: Action[] = []
    public description?: string

    constructor(public registry: TaskRegistry, public name: string) {
    }

    public does(firstArg: string | TemplateStringsArray, ...args: string[]): this {
        this.description = stringifyTemplate(firstArg, ...args);
        return this
    }

    public after(firstArg: void | string | TemplateStringsArray, ...args: string[]): this {
        if (!firstArg) {
            throw new Error('cannot depend on zero other tasks')
        }
        if (typeof firstArg !== "string") {
            this._registerDependencies(stringifyTemplate(firstArg, ...args).split(',').map(str => str.trim()))
        } else {
            this._registerDependencies([firstArg, ...args]);
        }
        return this;
    }

    private _invariant(condition: boolean, error: string) {
        if (condition) {
            throw new ImpossibleStateError(error)
        }
    }

    private _registerDependencies(tasks: string[]) {
        this._invariant(this.type === TaskType.Composite, "cannot register dependencies for composite task")

        checkArrayTypes("string", tasks);

        for (const task of tasks) {
            this.registry.registerDependency(task, this.name)
        }
    }

    private _registerComposition(composition: string[]) {
        this._invariant(this._hasDependencies(), "cannot either have dependencies and be a composite task; try to decompose it into separate tasks")
        this.type = TaskType.Composite

        checkArrayTypes("string", composition);

        for (const task of composition) {
            this.registry.registerDependency(task, this.name)
        }
    }

    private _registerActions(fns: Action[]) {
        if (this.type === TaskType.Composite) {
            throw new ImpossibleStateError("cannot register actions for composite task")
        }
        this.type = TaskType.Functional

        checkArrayTypes("function", fns);

        if (!this.fns) {
            this.fns = []
        }
        this.fns.push(...fns);
    }

    private _hasDependencies(): boolean {
        return this.registry.hasDependences(this.name);
    }

    is(strings: TemplateStringsArray, ...substitutions: string[]): string
    is(...strings: string[]): string
    is(fn: Action, ...fns: Array<Action>): string
    is(...args: any[]): string {
        if (args.length === 0) {
            throw new TypeError();
        }
        if (args.length === 1 && typeof args[0] === 'function') {
            this._registerActions(args);
            /*args are either template string args or array of strings*/
        } else {
            if (typeof args[0] === "string") {
                this._registerComposition(args)
            } else {
                const body = stringifyTemplate(args[0], ...args.slice(1))
                const tasks = body.trim().split(/ *[,;] */img)
                this._registerComposition(tasks)
            }
        }

        return this.name;
    }
}
