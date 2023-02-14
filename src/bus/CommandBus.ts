import { CommandHandlerAlreadyRegisteredException, CommandHandlerNotRegisteredException } from "@app/bus/exceptions";
import { Constructor } from "@app/bus/utils";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class AbstractBaseCommand {
  // to make typing safe
  public $$cqe$internal$command: undefined;
}
export type CommandHandler<CommandType extends AbstractBaseCommand> = (command: CommandType) => Promise<void> | void;

type AnyCommandHandler = CommandHandler<AbstractBaseCommand>;

export class CommandBus {
  private handlers: Record<string, AnyCommandHandler | undefined> = {};

  public register<T extends AbstractBaseCommand>(commandClass: Constructor<T>, handler: CommandHandler<T>): void {
    const commandName = commandClass.name;
    if (this.handlers[commandName]) {
      throw new CommandHandlerAlreadyRegisteredException(commandName);
    }
    this.handlers[commandName] = handler as AnyCommandHandler;
  }

  public getHandledCommands(): string[] {
    return Object.keys(this.handlers);
  }

  public unregister<T extends AbstractBaseCommand>(commandClass: Constructor<T>): void {
    const commandName = commandClass.name;
    this.handlers = Object.fromEntries(Object.entries(this.handlers).filter((kv) => kv[0] !== commandName));
  }

  public hasHandler<T extends AbstractBaseCommand>(commandClass: Constructor<T>): boolean {
    const commandName = commandClass.name;
    return !!this.handlers[commandName];
  }

  public async execute<T extends AbstractBaseCommand>(command: T): Promise<void> {
    const commandName = command.constructor.name;
    const handler = this.handlers[commandName];
    if (!handler) {
      throw new CommandHandlerNotRegisteredException(commandName);
    }
    await handler(command);
  }
}
