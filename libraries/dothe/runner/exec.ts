import {resolve} from "path";
import * as execa from "execa";
import * as R from "ramda";

class ConfigParseError extends Error {}

export async function exec(script: string, paths: string[], ...args: string[]) {
    const nodeArgs = [
        '-r', resolve(__dirname, 'mock-console-output.js'),
        ...R.unnest(paths.map(path => ['-r', path])),
        resolve(__dirname, script),
        ...args
    ];

    const {exitCode, exitCodeName} = await execa("node", nodeArgs, {
        stdio: "inherit"
    });

    if (exitCode) {
        throw new ConfigParseError('configuration exited with code' + exitCodeName)
    }
}
