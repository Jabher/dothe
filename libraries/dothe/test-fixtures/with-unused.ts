import task from "dothe"

task`default`
    .does`make the bundle`
    .is`foo`;

task`foo`
    .is( () => {});

task`baz`
    .is(() => {});

