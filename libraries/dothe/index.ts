import {registry} from "./lib/TaskRegistry";
import {stringifyTemplate} from "./lib/stringifyTemplate";
import {Task} from "./lib/Task";


export function task(strings: TemplateStringsArray, ...substitutions: string[]): Task {
    return registry.registerTask(stringifyTemplate(strings, ...substitutions));
}

export default task;
