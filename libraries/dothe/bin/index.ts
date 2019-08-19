#!/usr/bin/node
import * as yargs from 'yargs'
import {describe, run} from "../runner";
import {getConfigFiles} from "./util/get-config-files";
import {name} from '../package.json'

const {argv} = yargs
    .scriptName(name)
    .usage("$0 <task>")
    .option("config", {
        describe: "configuration file",
        requiresArg: false,
        type: "string"
    })
    .option("describe", {
        describe: "produces tasks schema",
        requiresArg: false,
        choices: ["dot", "json", true]
    })
    .help()

getConfigFiles(process.cwd(), argv.config)
    .then(async configFiles => {
        if (argv.describe) {
            await describe(configFiles, argv._);
        } else {
            await run(configFiles, argv._);
        }
    })
