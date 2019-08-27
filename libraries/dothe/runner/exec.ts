import {resolve} from "path";
import * as execa from "execa";
import * as R from "ramda";

class ConfigParseError extends Error {}

export async function exec(script: string, paths: string[], ...args: string[]) {
    const nodeArgs = [
        ...R.unnest(R.uniq(paths).map(path => ['-r', path])),
        '-r', resolve(__dirname, "scripts", "validate-global-state.js"),
        resolve(__dirname, "scripts", script),
        ...args
    ];

    const {exitCode, exitCodeName} = await execa("node", nodeArgs, {
        stdio: "inherit",
        reject: false
    });

    switch (exitCode) {

        case 0:
            return;
        case 126:
            process.exit(1);
            return;
        default:
            throw new ConfigParseError(`configuration exited with code ${exitCode} (${exitCodeName})`)
    }
}
