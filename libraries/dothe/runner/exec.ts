import {resolve} from "path";
import * as execa from "execa";
import * as R from "ramda";

export async function exec(script: string, paths: string[], ...args: string[]) {
    const nodeArgs = [
        ...R.unnest(R.uniq(paths).map(path => ['-r', resolve(process.cwd(), path)])),
        '-r', resolve(__dirname, "scripts", "validate-global-state.js"),
        resolve(__dirname, "scripts", script),
        ...args
    ];

    const {exitCode, exitCodeName} = await execa("node", nodeArgs, {
        stdio: "inherit",
        reject: false,
        env: {
            ...process.env,
            DOTHE_FILE_PATHS: JSON.stringify(paths)
        }
    });

    switch (exitCode) {
        case 0:
            return;
        case 126:
            process.exit(1);
            return;
        default:
            process.stderr.write(`configuration exited with code ${exitCode} (${exitCodeName})`, () => process.exit(1));
    }
}
