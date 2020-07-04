"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataService = void 0;
const logger_1 = require("../logger");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const v4_1 = __importDefault(require("uuid/v4"));
const jf = __importStar(require("joiful"));
const ioredis_1 = __importDefault(require("ioredis"));
const kafkajs_1 = require("kafkajs");
const redis_service_1 = require("./redis.service");
const data_model_1 = require("../models/data.model");
const Counter = require("prom-client").Counter;
class DataService {
    constructor() {
        this.redisService = new redis_service_1.RedisService();
        this.redisClient = null;
        //Setting counters
        this.messagesCounter = new Counter({
            name: "app_counter_messages_total",
            help: "Counter of messages received",
        });
        this.correctMessagesCounter = new Counter({
            name: "app_correct_messages_counter_total",
            help: "Counter of correct messages received",
        });
        this.failedMessagesCounter = new Counter({
            name: "app_failed_messages_counter_total",
            help: "Counter of correct messages received",
        });
    }
    async start(kafkaHost, topic) {
        let config = {
            clientId: "kafka-redis-jest-example",
            brokers: (process.env.KAFKAHOST || kafkaHost).split(","),
        };
        this.kafka = new kafkajs_1.Kafka(config);
        this.setUpConsumer(topic);
    }
    /**
     * Set up for Redis
     */
    async setUpRedis() {
        if (this.redisClient === null) {
            if (process.env.REDIS_EVENTS_CONFIG_JSON) {
                var config = JSON.parse(process.env.REDIS_EVENTS_CONFIG_JSON);
                logger_1.log.info("[REDIS] - Using redis config: " +
                    process.env.REDIS_EVENTS_CONFIG_JSON);
                this.redisClient = new ioredis_1.default(config);
            }
            else {
                logger_1.log.info("[REDIS] - Using localhost/0 for redis connection");
                this.redisClient = new ioredis_1.default({});
            }
            //Defining commands
            this.redisClient.defineCommand("divideResults", {
                numberOfKeys: 1,
                lua: fs_1.default.readFileSync(path_1.default.join(__dirname, "../divideResults.lua"), {
                    encoding: "utf8",
                }),
            });
        }
    }
    /**
     * Set up the consumer
     * @param topic Topic to listen the message
     */
    async setUpConsumer(topic) {
        const consumer = this.kafka.consumer({ groupId: `exampleTopic-${v4_1.default()}` });
        consumer.on(consumer.events.CRASH, (err, groupId) => {
            logger_1.log.error("[KAFKA] - Consumer crashed by ", err, groupId);
            process.exit(2);
        });
        await consumer.connect();
        await consumer.subscribe({ topic: topic, fromBeginning: true });
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const messageValue = {
                    value: message.value.toString(),
                };
                logger_1.log.info(`[KAFKA] - Receiving new message from [Topic: ${topic}]`);
                logger_1.log.info(messageValue);
                this.handleMessage(topic, message);
            },
        });
    }
    /**
     * Message processor
     * @param topic Topic to listen the message
     * @param kafkaMsg Json value
     */
    async handleMessage(topic, kafkaMsg) {
        this.messagesCounter.inc();
        const dataMsg = kafkaMsg.value.toString();
        if (this.isValidMessage(dataMsg)) {
            await this.setUpRedis();
            this.correctMessagesCounter.inc();
            this.redisService.updateUsingScript(dataMsg, this.redisClient);
        }
        else {
            this.failedMessagesCounter.inc();
            logger_1.log.error("[KAFKA] - Invalid message: ", dataMsg);
        }
    }
    isValidMessage(value) {
        return !jf.validateAsClass(value, data_model_1.DataMsg).error;
    }
}
exports.DataService = DataService;
