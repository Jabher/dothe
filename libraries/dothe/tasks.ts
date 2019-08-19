import task from "./index"

task`default`
    .does`bundle`
    .is`foo, bar`

task`foo`
    .is(async () => {
        await new Promise(res => setTimeout(res, 1000))
        console.log('prelog')
    })
/*todo support generator functions*/

task`bar`
    .after`foo`
