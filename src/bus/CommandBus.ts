import { CommandHandlerAlreadyRegisteredException, CommandHandlerNotRegisteredException } from "@app/bus/exceptions";
import { CommandHandler, Constructor, MessageType } from "@app/bus/utils";

export class CommandBus {
  private handlers: Record<string, CommandHandler<MessageType> | undefined> = {};

  public register<T extends MessageType>(commandClass: Constructor<T>, handler: CommandHandler<T>): void {
    const commandName = commandClass.name;
    if (this.handlers[commandName]) {
      throw new CommandHandlerAlreadyRegisteredException(commandName);
    }
    this.handlers[commandName] = handler as CommandHandler<MessageType>;
  }

  public getHandledCommands(): string[] {
    return Object.keys(this.handlers);
  }

  public unregister<T extends MessageType>(commandClass: Constructor<T>): void {
    const commandName = commandClass.name;
    this.handlers = Object.fromEntries(Object.entries(this.handlers).filter((kv) => kv[0] !== commandName));
  }

  public hasHandler<T extends MessageType>(commandClass: Constructor<T>): boolean {
    const commandName = commandClass.name;
    return !!this.handlers[commandName];
  }

  public async execute<T extends MessageType = MessageType>(command: T): Promise<void> {
    const commandName = command.constructor.name;
    const handler = this.handlers[commandName];
    if (!handler) {
      throw new CommandHandlerNotRegisteredException(commandName);
    }
    await handler(command);
  }
}
