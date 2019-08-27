export type IAncestorChain<T> = [T, ...T[]] & Array<T>

function* getCyclicReferenceChain<T>(child: Node<T>, chain: IAncestorChain<Node<T>>): IterableIterator<IAncestorChain<Node<T>>> {
    const newChain: IAncestorChain<Node<T>> = [child, ...chain];
    if (chain.includes(child)) {
        yield newChain;
    } else {
        for (const ancestor of child.ancestors) {
            yield* getCyclicReferenceChain(ancestor, newChain);
        }
    }
}

export class CycleError<T> extends Error {
    constructor(public chains: IAncestorChain<Node<T>>[]) {
        super(`CyclicDependencyError`);
    }
}

export class Node<T> {
    public ancestors = new Set<Node<T>>();

    constructor(public value: T) {
    }

    addAncestor(node: Node<T>) {
        this.ancestors.add(node);
        const chains = [...getCyclicReferenceChain<T>(node, [this])];
        if (chains.length !== 0) {
            throw new CycleError(chains);
        }
    }
}
