export type MessageType = object;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T> = new (...args: any[]) => T;
export type CommandHandler<T> = (command: T) => Promise<void> | void;
export type EventHandler<T> = (event: T) => Promise<void> | void;

export abstract class AbstractBaseQuery<ResType> {
  public $$cqe$internal$queryReturnHelper!: ResType; // somehow is not visible, good
}
export type ExtractQueryReturnType<QueryType extends AbstractBaseQuery<unknown>> =
  QueryType["$$cqe$internal$queryReturnHelper"];

export type QueryHandler<QueryType extends AbstractBaseQuery<unknown>> = (
  query: QueryType
) => Promise<ExtractQueryReturnType<QueryType>> | ExtractQueryReturnType<QueryType>;
