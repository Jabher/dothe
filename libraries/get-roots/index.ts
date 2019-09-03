import {dirname, resolve} from "path";
import {pathExistsSync} from "fs-extra";

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

export const getPackageRoot = (location: string) => getRootByFilename(location, ['package.json']);
export const getGitRoot = (location: string) => getRootByFilename(location, ['.git']);
export const getMonorepoRoot = (location: string) => getRootByFilename(location, ['rush.json', 'lerna.json']);
