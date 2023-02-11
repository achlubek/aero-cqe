class CommandBusException extends Error {
  public constructor(public readonly commandName: string, message: string) {
    super(message);
  }
}

export class CommandHandlerAlreadyRegisteredException extends CommandBusException {
  public constructor(commandName: string) {
    super(commandName, "Handler already registered");
  }
}

export class CommandHandlerNotRegisteredException extends CommandBusException {
  public constructor(commandName: string) {
    super(commandName, "Handler not registered");
  }
}

class QueryBusException extends Error {
  public constructor(public readonly queryName: string, message: string) {
    super(message);
  }
}

export class QueryHandlerAlreadyRegisteredException extends QueryBusException {
  public constructor(queryName: string) {
    super(queryName, "Handler already registered");
  }
}

export class QueryHandlerNotRegisteredException extends QueryBusException {
  public constructor(queryName: string) {
    super(queryName, "Handler not registered");
  }
}
