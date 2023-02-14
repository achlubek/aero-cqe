import { assert } from "chai";

import { AbstractBaseEvent, EventBus } from "@app/bus/EventBus";

import sinon = require("sinon");

const isUUID = (str: string): boolean => {
  const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
  return regexExp.test(str);
};

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class TestEvent extends AbstractBaseEvent {}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class TestEvent1 extends AbstractBaseEvent {}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class TestEvent2 extends AbstractBaseEvent {}

describe("EventBus unit", () => {
  it("Subscribe", () => {
    const eventBus = new EventBus();

    const subscriptionId = eventBus.subscribe(TestEvent, sinon.fake());

    assert.isTrue(isUUID(subscriptionId));
    assert.lengthOf(eventBus.getHandledEvents(), 1);
    assert.include(eventBus.getHandledEvents(), TestEvent.name);
  });

  it("Unsubscribe by event name", () => {
    const eventBus = new EventBus();

    eventBus.subscribe(TestEvent1, sinon.fake());
    eventBus.subscribe(TestEvent2, sinon.fake());

    assert.lengthOf(eventBus.getHandledEvents(), 2);
    assert.include(eventBus.getHandledEvents(), TestEvent1.name);
    assert.include(eventBus.getHandledEvents(), TestEvent2.name);

    eventBus.unsubscribeByEventClass(TestEvent1);

    assert.lengthOf(eventBus.getHandledEvents(), 1);
    assert.include(eventBus.getHandledEvents(), TestEvent2.name);

    eventBus.unsubscribeByEventClass(TestEvent2);

    assert.lengthOf(eventBus.getHandledEvents(), 0);
  });

  it("Unsubscribe by subscription id", () => {
    const eventBus = new EventBus();

    const subscriptionId1 = eventBus.subscribe(TestEvent1, sinon.fake());
    const subscriptionId2 = eventBus.subscribe(TestEvent2, sinon.fake());

    assert.isTrue(isUUID(subscriptionId1));
    assert.isTrue(isUUID(subscriptionId2));

    assert.lengthOf(eventBus.getHandledEvents(), 2);
    assert.include(eventBus.getHandledEvents(), TestEvent1.name);
    assert.include(eventBus.getHandledEvents(), TestEvent2.name);

    eventBus.unsubscribeBySubscriptionId(subscriptionId1);

    assert.lengthOf(eventBus.getHandledEvents(), 1);
    assert.include(eventBus.getHandledEvents(), TestEvent2.name);

    eventBus.unsubscribeBySubscriptionId(subscriptionId2);

    assert.lengthOf(eventBus.getHandledEvents(), 0);
  });

  it("List handled events", () => {
    const eventBus = new EventBus();

    eventBus.subscribe(TestEvent1, sinon.fake());
    eventBus.subscribe(TestEvent2, sinon.fake());

    assert.lengthOf(eventBus.getHandledEvents(), 2);
    assert.include(eventBus.getHandledEvents(), TestEvent1.name);
    assert.include(eventBus.getHandledEvents(), TestEvent2.name);
  });

  it("Publish an event", async () => {
    const eventBus = new EventBus();

    const handler = sinon.fake();
    eventBus.subscribe(TestEvent, handler);
    const event = new TestEvent();
    await eventBus.publish(event);

    assert.isTrue(handler.calledOnceWithExactly(event));
  });
});
