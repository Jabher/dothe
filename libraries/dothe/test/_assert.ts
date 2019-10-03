import {getPackageRoot} from 'get-roots'
import {resolve, relative} from 'path';
import {ExecutionContext} from 'ava';
import * as execa from 'execa';

export async function testFixtureMacro(t: ExecutionContext, fixture: string, expected: Object, ...passedArgs: string[]) {
    const fixturePath = resolve(await getPackageRoot(__dirname), "test-fixtures", fixture);
    const args = [require.resolve("../bin/index.js"), "--describe", "--config", relative(process.cwd(), fixturePath), ...passedArgs];
    const {stdout, stderr, exitCode} = await execa("npx", args, {
        stdio: "pipe",
        reject: false,
        cwd: process.cwd(),
    });
    if (exitCode) {
        console.log(stderr);
        throw new Error(`process returned code ${exitCode}`);
    }

    let description: Object;
    try {
        description = JSON.parse(stdout);
    } catch (e) {
        throw new Error(`cannot parse ${stdout}`)
    }
    t.deepEqual(description, expected);
}
