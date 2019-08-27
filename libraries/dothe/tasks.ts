import task from "./index"

task`default`
    .does`make the bundle`
    .is`foo, baz`;

task`foo`
    .after`baz`
    .is(async () => {
        await new Promise(res => setTimeout(res, 1000))
    });

task`baz`
    .after`foo`
    .is(async () => {
        await new Promise(res => setTimeout(res, 1000))
    });

