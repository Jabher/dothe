import {dirname, resolve} from "path";
import * as fs from "fs";

const pathExistsSync = (path: string) => {
    try {
        fs.accessSync(path, fs.constants.F_OK);
        return true;
    } catch (err) {
    }
    return false;
};

export function getRootByFilename(location: string, filenames: string[]): string {
    let newLocation = location;
    let currentLocation: string;
    do {
        currentLocation = newLocation;
        for (const filename of filenames) {
            if (pathExistsSync(resolve(currentLocation, filename))) {
                return currentLocation;
            }
        }
        newLocation = dirname(currentLocation)
    } while (currentLocation !== newLocation);
    throw new Error(`was not able to find root in ${location}`)
}

export const getGitRoot = (location: string) => getRootByFilename(location, ['.git']);
export const getPackageRoot = (location: string) => getRootByFilename(location, ['package.json']);
export const getMonorepoRoot = (location: string) => getRootByFilename(location, ['rush.json', 'lerna.json']);
