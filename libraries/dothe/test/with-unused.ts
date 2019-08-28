import test from 'ava'
import {testFixtureMacro} from "./_assert";

test("with-unused", testFixtureMacro, "with-unused.js", {
    passedTasks: ['default'],
    tasks: {
        default: ['foo'],
        foo: []
    }
});

test("with-unused-explicit", testFixtureMacro, "with-unused.js", {
    passedTasks: ['foo', 'baz', 'default'],
    tasks: {
        default: ['foo'],
        foo: [],
        baz: []
    }
}, 'foo', 'baz', 'default');
