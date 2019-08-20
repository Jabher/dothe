import {registry} from "./lib/TaskRegistry";
import {stringifyTemplate} from "./lib/stringifyTemplate";
import {Task} from "./lib/Task";


function task(strings: TemplateStringsArray, ...substitutions: string[]): Task {
    return registry.registerTask(stringifyTemplate(strings, ...substitutions));
}

task.task = task;
task.default = task;
export default task;
module.exports = task;
