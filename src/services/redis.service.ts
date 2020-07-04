import logger, { log } from "../logger";
import { Redis } from "ioredis";
const Counter = require("prom-client").Counter;
const Gauge = require("prom-client").Gauge;

import { DataMsg } from "../models/data.model";

export class RedisService {
  redisClient: Redis = null;

  //Setting counters
  redisInsertsTotalCounter = new Counter({
    name: "app_redis_inserts_total",
    help: "Total of inserts on Redis",
  });
  redisFailedInsertsTotalCounter = new Counter({
    name: "app__redis_inserts_failed_total",
    help: "Total of failed inserts on Redis",
  });
  timerGauge = new Gauge({
    name: "app_timer",
    help: "Timer",
  });
  async updateUsingScript(message: string, redisClient: Redis) {
    this.redisClient = redisClient;
    const dataMsg: DataMsg = JSON.parse(message);

    try {
      dataMsg.addresses.forEach((address) => {
        log.info(address);
        const key = dataMsg.user.name + address.address;
        const args = [
          `${key}`,
          dataMsg.user.name,
          address.address,
          address.telephone,
        ];
        this.redisClient["divideResults"](args).then((value: string) => {
          log.info(`[REDIS] - Tracked results: ${value}`);
          this.redisInsertsTotalCounter.inc();
        });
        this.timerGauge.set(Date.now() / 1000.0);
      });
    } catch (err) {
      log.error(`[REDIS] - Failed track: ${err}`);
      this.redisFailedInsertsTotalCounter.inc();
    }
  }
}
