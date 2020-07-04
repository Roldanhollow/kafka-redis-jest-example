"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
const morgan_1 = __importDefault(require("morgan"));
const chalk_1 = __importDefault(require("chalk"));
const pino_1 = __importDefault(require("pino"));
const logger = morgan_1.default((tokens, req, res) =>
  [
    chalk_1.default.hex("#ff4757").bold("🍄  Morgan --> "),
    chalk_1.default.hex("#34ace0").bold(tokens.method(req, res)),
    chalk_1.default.hex("#ffb142").bold(tokens.status(req, res)),
    chalk_1.default.hex("#ff5252").bold(tokens.url(req, res)),
    chalk_1.default
      .hex("#2ed573")
      .bold(`${tokens["response-time"](req, res)} ms`),
    chalk_1.default.hex("#f78fb3").bold(`@ ${tokens.date(req, res)}`),
    chalk_1.default.yellow(tokens["remote-addr"](req, res)),
    chalk_1.default.hex("#fffa65").bold(`from ${tokens.referrer(req, res)}`),
    chalk_1.default.hex("#1e90ff")(tokens["user-agent"](req, res)),
  ].join(" ")
);
exports.log = pino_1.default({
  prettyPrint: true,
  name: "kafka-redis-jest-example",
  level: "debug",
});
exports.default = logger;
