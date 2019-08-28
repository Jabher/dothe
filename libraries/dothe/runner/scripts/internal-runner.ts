import * as Listr from 'listr'
import {MapWithDefault} from "collections-plus";
import {registeredTasks, taskDescriptions, taskNodeRegistry} from "../../lib/global-state";
import {tasks} from "../argv-tasks";
import * as execa from "execa";
import {resolve} from 'path';
import * as R from "ramda";
import * as fs from "fs-extra";

export const getStderrLogLocation = (taskName: string) => resolve(process.cwd(), `.dothe-logs`, `${taskName}.stderr.log`);
export const getStdoutLogLocation = (taskName: string) => resolve(process.cwd(), `.dothe-logs`, `${taskName}.stdout.log`);
const write = (filename: string, data: string) => {
    fs.ensureFileSync(filename);
    fs.writeFileSync(filename, data);
};

let failedTask: void | string;

const runSingleTask = async (taskName: string, onStateChage: (state: string) => void) => {
    const filePaths: string[] = JSON.parse(process.env.DOTHE_FILE_PATHS as string);
    const getStepName = (index: number) => task.fns.length > 1 ? `step ${index + 1}` : `running`;
    const task = registeredTasks.get(taskName)!;
    const stdouts = [];
    const stderrs = [];
    try {
        for (const index of task.fns.map((_, i) => i)) {
            const fn = task.fns[index];
            onStateChage(fn.name ? `${getStepName(index)}: ${fn.name}` : getStepName(index));
            const {stdout, stderr, exitCode} = await execa("node", [
                ...R.unnest(filePaths.map(path => ["-r", path])),
                resolve(__dirname, "run-single.js")
            ], {
                reject: false,
                env: {
                    ...process.env,
                    DOTHE_TASK_NAME: taskName,
                    DOTHE_STEP: index.toString(),
                }
            });
            stdouts.push(stdout);
            stderrs.push(stderr);

            if (exitCode) {
                failedTask = taskName;
                throw new Error(exitCode.toString());
            }
        }
    } finally {
        write(getStderrLogLocation(taskName), stderrs.join("\n---\n"));
        write(getStdoutLogLocation(taskName), stdouts.join("\n---\n"));
    }
};


const createTask = (resolutions: MapWithDefault<string, Deferred>) => (taskName: string): Listr.ListrTask<any> => {
    const description = taskDescriptions.get(taskName);
    const title = description ? `${taskName} (${description})` : taskName;
    const dependencies = [...taskNodeRegistry.get(taskName).ancestors].map(({value}) => value);
    const deferred = resolutions.get(taskName);
    return {
        title,
        task: async (_, task) => {
            const unresolvedDependencies = new Set(dependencies);
            const failedDependencies = new Set<string>();
            const toStr = (deps: Set<string>) => [...deps].join(', ');
            const updateTask = () => {
                if (failedDependencies.size === dependencies.length) {
                    task.output = `all of dependencies failed: ${toStr(failedDependencies)}`
                } else if (failedDependencies.size > 0) {
                    task.output = `some of dependencies failed: ${toStr(failedDependencies)}`
                } else if (unresolvedDependencies.size > 0) {
                    task.output = `waiting for ${[...unresolvedDependencies].join(', ')}`
                } else {
                    task.output = `all dependencies resolved`;
                }
            };
            updateTask();
            await Promise.all(
                dependencies.map(async name => {
                    try {
                        await resolutions.get(name);
                    } catch (e) {
                        failedDependencies.add(name);
                    }
                    unresolvedDependencies.delete(name);
                    updateTask();
                })
            ).then(() => null, () => null);
            if (failedDependencies.size > 0) {
                updateTask();
                throw new Error();
            }

            const runTask = runSingleTask(taskName, (output) => {
                task.output = output;
            });
            // noinspection ES6MissingAwait
            runTask.then(deferred.resolve, () => {
                setTimeout(deferred.reject, 10);
            });
            await runTask.catch(async () => Promise.reject(await fs.readFile(getStdoutLogLocation(taskName))));
        }
    };
};

const collect = (tasks: string[]): string[] => {
    const metTasks = new Set<string>(tasks);
    for (const task of metTasks) {
        for (const ancestor of taskNodeRegistry.get(task).ancestors) {
            metTasks.add(ancestor.value);
        }
    }
    return [...metTasks];
};

type Deferred = Promise<void> & { resolve: () => void, reject: () => void };

const createDeferred = (): Deferred => {
    let resolve: () => void, reject: () => void;
    const promise = new Promise<void>((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });
    // @ts-ignore
    return Object.assign(promise, {resolve, reject}) as Deferred;
};

const run = async (tasks: string[]) => {
    await new Listr(
        [...collect(tasks)]
            .map(createTask(new MapWithDefault<string, Deferred>(createDeferred))),
        {
            concurrent: true
        }).run();
};

run(Object.keys(tasks)).catch(async error => {
    if (typeof failedTask !== "undefined")
        console.log(fs.readFileSync(getStderrLogLocation(failedTask), "utf8"));
    else
        console.log(error);
    process.stderr.write(error.message ? error.message + '\n' : '', () => {
        process.exit(1);
    });
});
