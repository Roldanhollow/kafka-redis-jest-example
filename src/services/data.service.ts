import { log } from "../logger";
import fs from "fs";
import path from "path";
import uuid from "uuid/v4";
import * as jf from "joiful";
import Redis from "ioredis";
import { KafkaConfig, Kafka, KafkaMessage } from "kafkajs";
import { RedisService } from "./redis.service";
import { DataMsg } from "../models/data.model";
const Counter = require("prom-client").Counter;

export class DataService {
  redisService: RedisService = new RedisService();
  kafka: Kafka;
  redisClient: Redis.Redis = null;

  //Setting counters
  messagesCounter = new Counter({
    name: "app_counter_messages_total",
    help: "Counter of messages received",
  });
  correctMessagesCounter = new Counter({
    name: "app_correct_messages_counter_total",
    help: "Counter of correct messages received",
  });
  failedMessagesCounter = new Counter({
    name: "app_failed_messages_counter_total",
    help: "Counter of correct messages received",
  });

  async start(kafkaHost: string, topic: string) {
    let config: KafkaConfig = {
      clientId: "kafka-redis-jest-example",
      brokers: (process.env.KAFKAHOST || kafkaHost).split(","),
    };

    this.kafka = new Kafka(config);

    this.setUpConsumer(topic);
  }

  /**
   * Set up for Redis
   */
  async setUpRedis() {
    if (this.redisClient === null) {
      if (process.env.REDIS_EVENTS_CONFIG_JSON) {
        var config = JSON.parse(process.env.REDIS_EVENTS_CONFIG_JSON);
        log.info(
          "[REDIS] - Using redis config: " +
            process.env.REDIS_EVENTS_CONFIG_JSON
        );
        this.redisClient = new Redis(config);
      } else {
        log.info("[REDIS] - Using localhost/0 for redis connection");
        this.redisClient = new Redis({});
      }
      //Defining commands
      this.redisClient.defineCommand("divideResults", {
        numberOfKeys: 1,
        lua: fs.readFileSync(path.join(__dirname, "../divideResults.lua"), {
          encoding: "utf8",
        }),
      });
    }
  }

  /**
   * Set up the consumer
   * @param topic Topic to listen the message
   */
  async setUpConsumer(topic: string) {
    const consumer = this.kafka.consumer({
      groupId: `example-topic-${uuid()}`,
    });

    consumer.on(consumer.events.CRASH, (err, groupId) => {
      log.error("[KAFKA] - Consumer crashed by ", err, groupId);
      process.exit(2);
    });

    await consumer.connect();
    await consumer.subscribe({ topic: topic, fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const messageValue = {
          value: message.value.toString(),
        };
        log.info(`[KAFKA] - Receiving new message from [Topic: ${topic}]`);
        log.info(messageValue);
        this.handleMessage(topic, message);
      },
    });
  }

  /**
   * Message processor
   * @param topic Topic to listen the message
   * @param kafkaMsg Json value
   */
  async handleMessage(topic: string, kafkaMsg: KafkaMessage) {
    this.messagesCounter.inc();

    const dataMsg = kafkaMsg.value.toString();
    if (this.isValidMessage(dataMsg)) {
      await this.setUpRedis();
      this.correctMessagesCounter.inc();
      this.redisService.updateUsingScript(dataMsg, this.redisClient);
    } else {
      this.failedMessagesCounter.inc();
      log.error("[KAFKA] - Invalid message: ", dataMsg);
    }
  }

  isValidMessage(value: string) {
    return !jf.validateAsClass(value, DataMsg).error;
  }
}
