import * as crypto from "crypto";

import { Constructor } from "@app/bus/utils";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class AbstractBaseEvent {
  // to make typing safe
  public $$cqe$internal$event: undefined;
}

export type EventHandler<EventType extends AbstractBaseEvent> = (event: EventType) => Promise<void> | void;

type AnyEventHandler = EventHandler<AbstractBaseEvent>;

class Subscription {
  public constructor(
    public readonly id: string,
    public readonly eventName: string,
    public readonly handler: AnyEventHandler
  ) {}
}

export class EventBus {
  private subscriptions: Subscription[] = [];

  public subscribe<T extends AbstractBaseEvent>(eventClass: Constructor<T>, handler: EventHandler<T>): string {
    const eventName = eventClass.name;
    const id = crypto.randomUUID();
    this.subscriptions.push(new Subscription(id, eventName, handler as AnyEventHandler));
    return id;
  }

  public getHandledEvents(): string[] {
    return this.subscriptions.map((s) => s.eventName);
  }

  public unsubscribeBySubscriptionId(id: string): void {
    this.subscriptions = this.subscriptions.filter((s) => s.id !== id);
  }

  public unsubscribeByEventClass<T extends AbstractBaseEvent>(eventClass: Constructor<T>): void {
    const eventName = eventClass.name;
    this.subscriptions = this.subscriptions.filter((s) => s.eventName !== eventName);
  }

  public async publish<T extends AbstractBaseEvent>(event: T): Promise<void> {
    await Promise.all(
      this.subscriptions.filter((s) => s.eventName === event.constructor.name).map(async (s) => await s.handler(event))
    );
  }
}
