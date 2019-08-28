import {tasks, passedTasks} from '../argv-tasks'

process.stdout.write(JSON.stringify({
    tasks, passedTasks
}) + '\n', () => {
    process.exit(0);
});
