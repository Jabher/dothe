import {dirname, resolve} from "path";
import {pathExists} from "fs-extra";

export async function getRootByFilename(location: string, filenames: string[]): Promise<string> {
    let newLocation = location;
    let currentLocation: string;
    do {
        currentLocation = newLocation;
        const exists = await Promise.all(filenames.map(filename => pathExists(resolve(currentLocation, filename))));
        if (await exists.some(doExist => doExist === true)) {
            return currentLocation;
        }
        newLocation = dirname(currentLocation)
    } while (currentLocation !== newLocation);
    throw new Error('was not able to find root in ' + location)
}

export const getPackageRoot = (location: string) => getRootByFilename(location, ['package.json']);
export const getGitRoot = (location: string) => getRootByFilename(location, ['.git']);
export const getMonorepoRoot = (location: string) => getRootByFilename(location, ['rush.json', 'lerna.json']);
