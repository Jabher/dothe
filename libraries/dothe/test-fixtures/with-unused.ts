import task from ".."

task`default`
    .does`make the bundle`
    .is`foo`;

task`foo`
    .is( () => {});

task`baz`
    .is(() => {});

