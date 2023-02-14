import { assert } from "chai";

import { QueryBus } from "@app/bus/QueryBus";
import { QueryHandlerAlreadyRegisteredException, QueryHandlerNotRegisteredException } from "@app/bus/exceptions";
import { AbstractBaseQuery } from "@app/bus/utils";

import sinon = require("sinon");

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class TestQuery extends AbstractBaseQuery<string> {}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class TestQuery1 extends AbstractBaseQuery<string> {}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class TestQuery2 extends AbstractBaseQuery<string> {}

describe("QueryBus unit", () => {
  it("Register a handler", () => {
    const queryBus = new QueryBus();

    queryBus.register(TestQuery, sinon.fake());
    assert.isTrue(queryBus.hasHandler(TestQuery));
  });

  it("Unregister a handler", () => {
    const queryBus = new QueryBus();

    queryBus.register(TestQuery, sinon.fake());
    assert.isTrue(queryBus.hasHandler(TestQuery));

    queryBus.unregister(TestQuery);
    assert.isFalse(queryBus.hasHandler(TestQuery));
  });

  it("List handled queries", () => {
    const queryBus = new QueryBus();

    queryBus.register(TestQuery1, sinon.fake());
    queryBus.register(TestQuery2, sinon.fake());

    assert.deepEqual(queryBus.getHandledQueries(), [TestQuery1.name, TestQuery2.name]);
  });

  it("List handled queries after one unregistering", () => {
    const queryBus = new QueryBus();

    queryBus.register(TestQuery1, sinon.fake());
    queryBus.register(TestQuery2, sinon.fake());

    assert.deepEqual(queryBus.getHandledQueries(), [TestQuery1.name, TestQuery2.name]);

    queryBus.unregister(TestQuery1);

    assert.deepEqual(queryBus.getHandledQueries(), [TestQuery2.name]);

    queryBus.unregister(TestQuery2);

    assert.deepEqual(queryBus.getHandledQueries(), []);
  });

  it("Execute a query", async () => {
    const queryBus = new QueryBus();

    const returnValue = "value";
    const handler = sinon.fake.returns(returnValue);
    queryBus.register(TestQuery, handler);

    const query = new TestQuery();
    const result = await queryBus.execute(query);

    assert.isTrue(handler.calledOnceWithExactly(query));
    assert.equal(result, returnValue);
  });

  it("Execute an async query", async () => {
    const queryBus = new QueryBus();

    const returnValue = "value";
    const handler = sinon.fake.returns(returnValue);
    queryBus.register(TestQuery, async (cmd) => Promise.resolve(handler(cmd)));

    const query = new TestQuery();
    const result = await queryBus.execute(query);

    assert.isTrue(handler.calledOnceWithExactly(query));
    assert.equal(result, returnValue);
  });

  it("Throws when executing a query without corresponding handler", async () => {
    const queryBus = new QueryBus();

    try {
      await queryBus.execute(new TestQuery());
      assert.fail("Did not throw");
    } catch (e) {
      assert.instanceOf(e, QueryHandlerNotRegisteredException);
      if (e instanceof QueryHandlerNotRegisteredException) {
        assert(e.queryName, TestQuery.name);
        assert(e.message, "Handler not registered");
      }
    }
  });

  it("Throws when registering a duplicate handler", () => {
    const queryBus = new QueryBus();

    queryBus.register(TestQuery, sinon.fake());

    assert.throw(
      () => queryBus.register(TestQuery, sinon.fake()),
      QueryHandlerAlreadyRegisteredException,
      "Handler already registered"
    );
  });
});
