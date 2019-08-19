import {ChildProcess} from 'child_process'

export type EmptyFn<R> = () => R
export type MaybePromise<T> = Promise<T> | T
export type Action = EmptyFn<MaybePromise<void | ChildProcess>>
