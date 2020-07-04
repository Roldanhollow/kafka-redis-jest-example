"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const logger_1 = require("../logger");
const Counter = require("prom-client").Counter;
const Gauge = require("prom-client").Gauge;
class RedisService {
    constructor() {
        this.redisClient = null;
        //Setting counters
        this.redisInsertsTotalCounter = new Counter({
            name: "app_redis_inserts_total",
            help: "Total of inserts on Redis",
        });
        this.redisFailedInsertsTotalCounter = new Counter({
            name: "app__redis_inserts_failed_total",
            help: "Total of failed inserts on Redis",
        });
        this.timerGauge = new Gauge({
            name: "app_timer",
            help: "Timer",
        });
    }
    async updateUsingScript(message, redisClient) {
        this.redisClient = redisClient;
        const dataMsg = JSON.parse(message);
        try {
            dataMsg.addresses.forEach((address) => {
                logger_1.log.info(address);
                const key = dataMsg.user.name + address.address;
                const args = [
                    `${key}`,
                    dataMsg.user.name,
                    address.address,
                    address.telephone,
                ];
                this.redisClient["divideResults"](args).then((value) => {
                    logger_1.log.info(`[REDIS] - Tracked results: ${value}`);
                    this.redisInsertsTotalCounter.inc();
                });
                this.timerGauge.set(Date.now() / 1000.0);
            });
        }
        catch (err) {
            logger_1.log.error(`[REDIS] - Failed track: ${err}`);
            this.redisFailedInsertsTotalCounter.inc();
        }
    }
}
exports.RedisService = RedisService;
