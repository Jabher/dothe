import task from ".."

task`default`
    .does`make the bundle`
    .is`foo, baz`;

task`foo`
    .after`baz`
    .is(() => {});


task`baz`
    .is(() => {});


