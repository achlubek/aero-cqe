import { assert } from "chai";

import { AbstractBaseCommand, CommandBus } from "@app/bus/CommandBus";
import { CommandHandlerAlreadyRegisteredException, CommandHandlerNotRegisteredException } from "@app/bus/exceptions";

import sinon = require("sinon");

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class TestCommand extends AbstractBaseCommand {}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class TestCommand1 extends AbstractBaseCommand {}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class TestCommand2 extends AbstractBaseCommand {}

describe("CommandBus unit", () => {
  it("Register a handler", () => {
    const commandBus = new CommandBus();

    commandBus.register(TestCommand, sinon.fake());
    assert.isTrue(commandBus.hasHandler(TestCommand));
  });

  it("Unregister a handler", () => {
    const commandBus = new CommandBus();

    commandBus.register(TestCommand, sinon.fake());
    assert.isTrue(commandBus.hasHandler(TestCommand));

    commandBus.unregister(TestCommand);
    assert.isFalse(commandBus.hasHandler(TestCommand));
  });

  it("List handled commands", () => {
    const commandBus = new CommandBus();

    commandBus.register(TestCommand1, sinon.fake());
    commandBus.register(TestCommand2, sinon.fake());

    assert.deepEqual(commandBus.getHandledCommands(), [TestCommand1.name, TestCommand2.name]);
  });

  it("List handled queries after one unregistering", () => {
    const commandBus = new CommandBus();

    commandBus.register(TestCommand1, sinon.fake());
    commandBus.register(TestCommand2, sinon.fake());

    assert.deepEqual(commandBus.getHandledCommands(), [TestCommand1.name, TestCommand2.name]);

    commandBus.unregister(TestCommand1);

    assert.deepEqual(commandBus.getHandledCommands(), [TestCommand2.name]);

    commandBus.unregister(TestCommand2);

    assert.deepEqual(commandBus.getHandledCommands(), []);
  });

  it("Execute a command", async () => {
    const commandBus = new CommandBus();

    const handler = sinon.fake();
    commandBus.register(TestCommand, handler);

    const command = new TestCommand();
    await commandBus.execute(command);

    assert.isTrue(handler.calledOnceWithExactly(command));
  });

  it("Execute an async command", async () => {
    const commandBus = new CommandBus();

    const returnValue = "value";
    const handler = sinon.fake.returns(returnValue);
    commandBus.register(TestCommand, (cmd) => void Promise.resolve(handler(cmd)));

    const command = new TestCommand();
    await commandBus.execute(command);

    assert.isTrue(handler.calledOnceWithExactly(command));
  });

  it("Throws when executing a command without corresponding handler", async () => {
    const commandBus = new CommandBus();

    try {
      await commandBus.execute(new TestCommand());
      assert.fail("Did not throw");
    } catch (e) {
      assert.instanceOf(e, CommandHandlerNotRegisteredException);
      if (e instanceof CommandHandlerNotRegisteredException) {
        assert(e.commandName, TestCommand.name);
        assert(e.message, "Handler not registered");
      }
    }
  });

  it("Throws when registering a duplicate handler", () => {
    const commandBus = new CommandBus();

    commandBus.register(TestCommand, sinon.fake());

    assert.throw(
      () => commandBus.register(TestCommand, sinon.fake()),
      CommandHandlerAlreadyRegisteredException,
      "Handler already registered"
    );
  });
});
