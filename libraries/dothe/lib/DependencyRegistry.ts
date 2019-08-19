import {MapWithDefault} from "./MapWithDefault"
import {CyclicReferenceError} from "./errors/CyclicReferenceError";
import {TaskRegistry} from "./TaskRegistry";


export class DependencyRegistry {
    froms = new MapWithDefault<string, Set<string>>(() => new Set())
    tos = new MapWithDefault<string, Set<string>>(() => new Set())

    constructor(private taskRegistry: TaskRegistry) {}

    add(from: string, to: string) {
        this.froms.get(to).add(from);
        this.tos.get(from).add(to);
    }

    has(to: string) {
        return this.froms.get(to).size !== 0;
    }

    toposort(...tos: string[]): {nodes: Set<string>, taskDependencies: MapWithDefault<string, Set<string>>} {
        const foundables = new Set(tos.map(foundable => ({foundable, path: [] as string[]})));
        const nodes = new Set<string>();
        const taskDependencies = new MapWithDefault<string, Set<string>>(() => new Set())
        for (const {foundable, path} of foundables) {
            if (path.includes(foundable)) {
                throw new CyclicReferenceError(`cyclic reference found: ${foundable} <- ${path.join(' <- ')}`)
            }
            nodes.add(foundable);
            if (!this.taskRegistry.tasks.has(foundable)) {
                throw new TypeError(`unknown task ${foundable}`)
            }
            for (const dependency of this.froms.get(foundable)) {
                if (!this.taskRegistry.tasks.has(dependency)) {
                    throw new TypeError(`unknown dependency ${dependency} of task ${foundable}`)
                }
                taskDependencies.get(foundable).add(dependency)

                foundables.add({foundable: dependency, path: [foundable, ...path]});
            }
        }

        return {nodes, taskDependencies}
    }
}
