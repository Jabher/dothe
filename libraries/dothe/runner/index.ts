import {exec} from "./exec";

export async function run(configurationPaths: string[], taskNames: string[]) {
    await exec("internal-runner.js", configurationPaths, ...taskNames);
}

export async function describe(configurationPaths: string[], taskNames: string[] = []) {
    const description = await exec("internal-describer.js", configurationPaths, ...taskNames);
    /*todo check schema?*/
    return description;
}
