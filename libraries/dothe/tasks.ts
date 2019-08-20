import task from "./index"

task`default`
    .does`make the bundle`
    .is`foo, baz`

task`foo`
    .is(async () => {
        await new Promise(res => setTimeout(res, 1000))
    })
/*todo support generator functions*/

task`baz`
    .is(async () => {
        await new Promise(res => setTimeout(res, 1000))
    })

task`bar`
    .after`foo`
    .is`baz`
