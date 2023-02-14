import { QueryHandlerAlreadyRegisteredException, QueryHandlerNotRegisteredException } from "@app/bus/exceptions";
import { AbstractBaseQuery, Constructor, ExtractQueryReturnType, QueryHandler } from "@app/bus/utils";

export class QueryBus {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handlers: Record<string, QueryHandler<AbstractBaseQuery<any>> | undefined> = {};

  public register<T extends AbstractBaseQuery<ExtractQueryReturnType<T>>>(
    queryClass: Constructor<T>,
    handler: QueryHandler<AbstractBaseQuery<ExtractQueryReturnType<T>>>
  ): void {
    const queryName = queryClass.name;
    if (this.handlers[queryName]) {
      throw new QueryHandlerAlreadyRegisteredException(queryName);
    }
    this.handlers[queryName] = handler;
  }

  public getHandledQueries(): string[] {
    return Object.keys(this.handlers);
  }

  public unregister<T extends AbstractBaseQuery<ExtractQueryReturnType<T>>>(queryClass: Constructor<T>): void {
    const queryName = queryClass.name;
    this.handlers = Object.fromEntries(Object.entries(this.handlers).filter((kv) => kv[0] !== queryName));
  }

  public hasHandler<T extends AbstractBaseQuery<ExtractQueryReturnType<T>>>(queryClass: Constructor<T>): boolean {
    const queryName = queryClass.name;
    return !!this.handlers[queryName];
  }

  public async execute<T extends AbstractBaseQuery<ExtractQueryReturnType<T>>>(
    query: T
  ): Promise<ExtractQueryReturnType<T>> {
    const queryName = query.constructor.name;
    const handler = this.handlers[queryName];
    if (!handler) {
      throw new QueryHandlerNotRegisteredException(queryName);
    }
    return handler(query) as Promise<ExtractQueryReturnType<T>>;
  }
}
