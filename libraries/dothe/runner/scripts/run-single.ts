import {registeredTasks} from "../../lib/global-state";
import {Task} from "../../lib/Task";

async function main() {
    const task = registeredTasks.get(process.env.DOTHE_TASK_NAME as string);
    if (!(task instanceof Task)) {
        process.exit(126);
        return;
    }

    const fn = task.fns[parseInt(process.env.DOTHE_STEP as string, 10)];
    if (!fn) {
        process.exit(126);
        return;
    }

    await fn();
}

console.log('running step', process.env.DOTHE_TASK_NAME, process.env.DOTHE_STEP);
main()
    .then(() => {
        console.log('step complete');
        process.exit(0);
    })
    .catch(error => {
        console.log('step failed');
        console.error(error);
        process.exit(1);
    });
