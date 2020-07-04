"use strict";

jest.unmock("kafkajs");
jest.mock("ioredis");
const { Kafka } = require("kafkajs");
import Redis from "ioredis";
import { DataService } from "../src/services/data.service";
import { RedisService } from "../src/services/redis.service";

const kafkaHost = "localhost:9092";
const exampleTopic = "exampleTopic";

//==========================
//     Testing 2 cases
//==========================
describe("Test kafka-redis-jest-example: LiveRedisService", () => {
  beforeAll(() => {
    redisAndRedisServiceMock();
  });
  const dataService = new DataService();

  //==========================
  //          Spies
  //==========================
  let handleMessageMock = jest.spyOn(dataService, "handleMessage");
  let messagesCounterSpy = jest.spyOn(dataService.messagesCounter, "inc");
  let correctMessagesCounterSpy = jest.spyOn(
    dataService.correctMessagesCounter,
    "inc"
  );
  let failedMessagesCounterSpy = jest.spyOn(
    dataService.failedMessagesCounter,
    "inc"
  );

  //==========================
  //      Topic: ExampleTopic
  //==========================
  describe(
    "- Kafka consume, Topic: [" +
      exampleTopic +
      "], Counters: [messagesCounter & correctMessagesCounter]",
    () => {
      beforeEach(() => {
        consumerMocks(exampleTopic, validJsonMock);
        dataService.start(kafkaHost, exampleTopic);
      });

      it("should be pass if received a valid message", async (done) => {
        setTimeout(() => {
          expect(handleMessageMock).toHaveBeenCalledWith(exampleTopic, {
            value: validJsonMock,
          });
          expect(messagesCounterSpy).toHaveBeenCalledTimes(1);
          expect(correctMessagesCounterSpy).toHaveBeenCalledTimes(1);
          done();
        }, 1);
      });
    }
  );
  describe(
    "- Kafka consume, Topic: [" +
      exampleTopic +
      "], Counters: [messagesCounter & failedMessagesCounterSpy]",
    () => {
      beforeEach(() => {
        consumerMocks(exampleTopic, invalidJsonMock);
        dataService.start(kafkaHost, exampleTopic);
      });

      it("should be failed if received an invalid message", async (done) => {
        setTimeout(() => {
          expect(handleMessageMock).toHaveBeenCalledWith(exampleTopic, {
            value: invalidJsonMock,
          });
          expect(messagesCounterSpy).toHaveBeenCalledTimes(2);
          expect(failedMessagesCounterSpy).toHaveBeenCalledTimes(1);
          done();
        }, 1);
      });
    }
  );
});

//==========================
//        Functions
//==========================
function redisAndRedisServiceMock() {
  Redis.prototype.defineCommand = jest.fn();
  RedisService.prototype.updateUsingScript = jest.fn();
}
function consumerMocks(topic, strJson) {
  consumerConnectMock = jest.fn();
  consumerSubscribeMock = jest.fn();
  consumerRunMock = jest.fn(({ eachMessage }) => {
    const getEachMessage = () =>
      eachMessage({
        message: { value: strJson },
        topic: topic,
      });
    setTimeout(getEachMessage, 0);
  });

  consumerDisconnectMock = jest.fn();
  consumerOnMock = jest.fn();
  consumerCRASHMock = jest.fn();
  consumerMock = jest.fn(() => {
    return {
      connect: consumerConnectMock,
      subscribe: consumerSubscribeMock,
      on: consumerOnMock,
      run: consumerRunMock,
      disconnect: consumerDisconnectMock,
      events: { CRASH: consumerCRASHMock },
    };
  });
  Kafka.prototype.consumer = consumerMock;
}

const validJSON = {
  user: {
    name: "NAME",
  },
  addresses: [
    {
      address: "137Street Av19",
      telephone: 300252552,
    },
    {
      address: "7Street Av19",
      telephone: 300252352,
    },
  ],
};

const validJsonMock = JSON.stringify(validJSON);
const invalidJsonMock = JSON.stringify("{}");

//==========================
//        Variables
//==========================
let consumerMock;
let consumerConnectMock;
let consumerSubscribeMock;
let consumerRunMock;
let consumerOnMock;
let consumerDisconnectMock;
let consumerCRASHMock;
