import {CycleError, Node} from "dagraph";
import {MapWithDefault} from "collections-plus";
import {Task} from "./Task";

export const discoveredCyclicDependencies = new Set<CycleError<string>>();

export const taskDescriptions = new Map<string, string>();
export const encounteredTasks = new MapWithDefault<string, string[]>(() => []);
export const registeredTasks = new Map<string, Task>();

export const taskNodeRegistry = new MapWithDefault<string, Node<string>>(name => new Node(name));
