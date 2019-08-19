import {Console} from 'console'
/*todo rethink it*/

// @ts-ignore bad ts typings
global.console = console = new Console(process.stdout, process.stdout)
