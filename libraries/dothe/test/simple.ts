import test from 'ava'
import {testFixtureMacro} from "./_assert";

test("simple", testFixtureMacro, "simple.js", {
    passedTasks: ['default'],
    tasks: {
        default: ['foo', 'baz'],
        foo: ['baz'],
        baz: []
    }
});
