import {MapWithDefault} from "./MapWithDefault"
import {CyclicReferenceError} from "./errors/CyclicReferenceError";


export class DependencyRegistry<Key = string> {
    froms = new MapWithDefault<Key, Set<Key>>(() => new Set())
    tos = new MapWithDefault<Key, Set<Key>>(() => new Set())

    add(from: Key, to: Key) {
        this.froms.get(to).add(from);
        this.tos.get(from).add(to);
    }

    has(to: Key) {
        return this.froms.get(to).size !== 0;
    }

    toposort(...tos: Key[]): {nodes: Set<Key>, taskDependencies: MapWithDefault<Key, Set<Key>>} {
        const foundables = new Set(tos.map(foundable => ({foundable, path: [] as Key[]})));
        const nodes = new Set<Key>();
        const taskDependencies = new MapWithDefault<Key, Set<Key>>(() => new Set())
        for (const {foundable, path} of foundables) {
            if (path.includes(foundable)) {
                throw new CyclicReferenceError(`cyclic reference found: ${foundable} <- ${path.join(' <- ')}`)
            }
            nodes.add(foundable);
            for (const dependency of this.froms.get(foundable)) {
                taskDependencies.get(foundable).add(dependency)

                foundables.add({foundable: dependency, path: [foundable, ...path]});
            }
        }

        return {nodes, taskDependencies}
    }
}
