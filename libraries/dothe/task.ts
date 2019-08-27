import {stringifyTemplate} from "./lib/util/stringifyTemplate";
import {Action} from "./lib/taskRunner";
import {Task} from "./lib/Task";
import {taskDescriptions} from "./lib/global-state";
import R = require("ramda");

abstract class TaskInterface {
    constructor(protected _task: Task) {
    }

    abstract is(...args: any[]): string

    does(strings: TemplateStringsArray, ...substitutions: string[]): this {
        taskDescriptions.set(this._task.name, stringifyTemplate(strings, ...substitutions));
        return this;
    }
}

const extractTeplateParts = (...args: [TemplateStringsArray, ...string[]]) => stringifyTemplate(...args).trim().split(/ *[,;] */img);

class FiniteTaskInterface extends TaskInterface {
    is(...args: [Action, ...Action[]]): string {
        if (args.length === 0) {
            throw new TypeError(`you should either define steps or comma-separated tasks composition`);
        } else if (args.every(R.is(Function))) {
            // @ts-ignore
            this._task.defineActions(args);
        } else {
            throw new TypeError(`unexpected arguments`);
        }

        return this._task.name;
    }
}

class CompositeTaskInterface extends TaskInterface {
    after(...args: [TemplateStringsArray, ...string[]]): FiniteTaskInterface {
        this._task.defineDependencies(extractTeplateParts(...args));
        return new FiniteTaskInterface(this._task);
    }

    is(...args: [Action, ...Action[]] | [TemplateStringsArray, ...string[]]): string {
        if (args.length === 0) {
            throw new TypeError(`you should either define steps or comma-separated tasks composition`);
        } else if (args.every(R.is(Function))) {
            // @ts-ignore
            this._task.defineActions(args);
        } else if (Array.isArray(args[0]) && args[0].every(R.is(String))) {
            // @ts-ignore
            this._task.defineDependencies(extractTeplateParts(...args))
        } else {
            throw new TypeError(`unexpected arguments`);
        }

        return this._task.name;
    }
}

export const task = (strings: TemplateStringsArray, ...substitutions: string[]): CompositeTaskInterface =>
    new CompositeTaskInterface(new Task(stringifyTemplate(strings, ...substitutions)));
