import task from "./index"

task`default`
    .does`make the bundle`
    .is`foo, bar, baz`;

task`foo`
    .after`baz`
    .is(async () => {
        await new Promise(res => setTimeout(res, 4000));
        console.error('error!');
        throw new Error('failed');
    });

task`bar`
    .is(async () => {
        await new Promise(res => setTimeout(res, 2000));
    }, async () => {
        await new Promise(res => setTimeout(res, 3000));
    });
task`baz`
    .is(async () => {
        await new Promise(res => setTimeout(res, 4000));
    });

