import * as crypto from "crypto";

import { Constructor, EventHandler, MessageType } from "@app/bus/utils";

class Subscription {
  public constructor(
    public readonly id: string,
    public readonly eventName: string,
    public readonly handler: EventHandler<MessageType>
  ) {}
}

export class EventBus {
  private subscriptions: Subscription[] = [];

  public subscribe<T extends MessageType>(eventClass: Constructor<T>, handler: EventHandler<T>): string {
    const eventName = eventClass.name;
    const id = crypto.randomUUID();
    this.subscriptions.push(new Subscription(id, eventName, handler as EventHandler<MessageType>));
    return id;
  }

  public getHandledEvents(): string[] {
    return this.subscriptions.map((s) => s.eventName);
  }

  public unsubscribeBySubscriptionId(id: string): void {
    this.subscriptions = this.subscriptions.filter((s) => s.id !== id);
  }

  public unsubscribeByEventClass<T extends MessageType>(eventClass: Constructor<T>): void {
    const eventName = eventClass.name;
    this.subscriptions = this.subscriptions.filter((s) => s.eventName !== eventName);
  }

  public async publish<T extends MessageType = MessageType>(event: T): Promise<void> {
    await Promise.all(
      this.subscriptions.filter((s) => s.eventName === event.constructor.name).map(async (s) => await s.handler(event))
    );
  }
}
