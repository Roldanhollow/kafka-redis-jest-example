"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Don't remove this comment. It's needed to format import lines nicely.
const data_service_1 = require("./data.service");
function default_1(app) {
    const kafkaHost = app.get("kafka_host");
    const topics = app.get("kafka_topics").split(",");
    new data_service_1.DataService().start(kafkaHost, topics);
}
exports.default = default_1;
