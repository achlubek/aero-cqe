import { QueryHandlerAlreadyRegisteredException, QueryHandlerNotRegisteredException } from "@app/bus/exceptions";
import { Constructor, MessageType, QueryHandler } from "@app/bus/utils";

export class QueryBus {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handlers: Record<string, QueryHandler<MessageType, any> | undefined> = {};

  public register<T extends MessageType, R>(queryClass: Constructor<T>, handler: QueryHandler<T, R>): void {
    const queryName = queryClass.name;
    if (this.handlers[queryName]) {
      throw new QueryHandlerAlreadyRegisteredException(queryName);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.handlers[queryName] = handler as QueryHandler<MessageType, any>;
  }

  public getHandledQueries(): string[] {
    return Object.keys(this.handlers);
  }

  public unregister<T extends MessageType>(queryClass: Constructor<T>): void {
    const queryName = queryClass.name;
    this.handlers = Object.fromEntries(Object.entries(this.handlers).filter((kv) => kv[0] !== queryName));
  }

  public hasHandler<T extends MessageType>(queryClass: Constructor<T>): boolean {
    const queryName = queryClass.name;
    return !!this.handlers[queryName];
  }

  public async execute<R, T extends MessageType = MessageType>(query: T): Promise<R> {
    const queryName = query.constructor.name;
    const handler = this.handlers[queryName];
    if (!handler) {
      throw new QueryHandlerNotRegisteredException(queryName);
    }
    return handler(query) as Promise<R>;
  }
}
