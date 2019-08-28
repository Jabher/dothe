#!/usr/bin/env node

import * as yargs from 'yargs'
import {describe, run} from "../runner";
import {getConfigFiles} from "./util/get-config-files";
import {name} from '../package.json'

const {argv} = yargs
    .scriptName(name)
    .usage("$0 <task>")
    .option("config", {
        describe: "configuration file",
        requiresArg: true,
        type: "string"
    })
    .option("noDependencies", {
        describe: "run without dependencies",
        alias: ["no-deps", "no-dependencies"]
    })
    .option("describe", {
        describe: "produces tasks schema"
    })
    .help();

getConfigFiles(process.cwd(), argv.config)
    .then(async configFiles => {
        if (argv.describe) {
            await describe(configFiles, argv._);
        } else {
            await run(configFiles, argv._);
        }
    });
