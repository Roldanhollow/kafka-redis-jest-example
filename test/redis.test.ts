"use strict";

import fs from "fs";
import path from "path";
import { RedisService } from "../src/services/redis.service";
let Redis = require("ioredis-mock");

//==========================
//     Testing 4 cases
//==========================
describe("Test kafka-redis-jest-example: RedisService", () => {
  const redisService = new RedisService();
  //==========================
  //          Spies
  //==========================
  let redisInsertsTotalCounterSpy = jest.spyOn(
    redisService.redisInsertsTotalCounter,
    "inc"
  );
  let redisFailedInsertsTotalCounterSpy = jest.spyOn(
    redisService.redisFailedInsertsTotalCounter,
    "inc"
  );
  let timerGaugeSpy = jest.spyOn(redisService.timerGauge, "set");

  describe("- Saving and counting the message values", () => {
    beforeEach(() => {
      redisMock();
    });

    it("should count on [redisInsertsTotalCounter] twice", async (done) => {
      redisService.updateUsingScript(jsonMock, redisClient);
      setTimeout(() => {
        expect(redisInsertsTotalCounterSpy).toHaveBeenCalledTimes(2);
        expect(timerGaugeSpy).toHaveBeenCalledTimes(2);
        done();
      }, 1);
    });
  });

  describe("- Saving and counting the message values", () => {
    beforeEach(() => {
      redisBadMock();
    });

    it("should be failed and counted on [redisFailedInsertsTotalCounter] once", async (done) => {
      redisService.updateUsingScript(jsonMock, null);
      setTimeout(() => {
        expect(redisFailedInsertsTotalCounterSpy).toHaveBeenCalledTimes(1);
        expect(timerGaugeSpy).toHaveBeenCalledTimes(2);
        done();
      }, 1);
    });
  });
});

//==========================
//        Functions
//==========================
function redisMock() {
  redisClient = new Redis();
  redisClient.defineCommand("divideResults", {
    numberOfKeys: 1,
    lua: fs.readFileSync(path.join(__dirname, "../src/divideResults.lua"), {
      encoding: "utf8",
    }),
  });
}
function redisBadMock() {
  redisClient = new Redis();
  redisClient.defineCommand("divideResults", () => {});
}

let normalJSON = {
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
let jsonMock = JSON.stringify(normalJSON);

//==========================
//        Variables
//==========================
let redisClient;
