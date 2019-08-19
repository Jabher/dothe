import {join, resolve} from 'path'
import {pathExists} from 'fs-extra'
import * as R from "ramda"
import {getPackageRoot} from "get-roots";

const files = R.pipe(
    R.map((filename: string) => [filename, join('.well-known', filename)]),
    R.unnest,
    R.map(filename => [filename, join(filename, 'index')]),
    R.unnest
)(["tasks.js"])

async function* getConfigFilesGenerator(root: string, configs?: string | string[]): AsyncIterable<string> {
    if (typeof configs === 'string') {
        yield* getConfigFilesGenerator(root, [configs])
    } else if (!configs) {
        const packageRoot = await getPackageRoot(root);
        const possibleCombinations = R.xprod([packageRoot, root], files).map(([dir, file]) => resolve(dir, file));
        for (const path of possibleCombinations) {
            if (await pathExists(path)) {
                yield path;
            }
        }
    } else {
        for (const path of configs) {
            if (await pathExists(path)) {
                yield path;
            } else {
                throw new Error('cannot resolve path ' + path);
            }
        }
    }
}

export async function getConfigFiles(root: string, configs?: string | string[]) {
    const array = [];
    for await (const item of getConfigFilesGenerator(root, configs)) {
        array.push(item);
    }
    return R.uniq(array);
}
