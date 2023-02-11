export type MessageType = object;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T> = new (...args: any[]) => T;
export type CommandHandler<T> = (command: T) => Promise<void> | void;
export type EventHandler<T> = (event: T) => Promise<void> | void;
export type QueryHandler<T, R> = (query: T) => Promise<R> | R;
