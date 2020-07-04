import { Application } from "../declarations";
// Don't remove this comment. It's needed to format import lines nicely.
import { DataService } from "./data.service";

export default function (app: Application) {
  const kafkaHost = app.get("kafka_host");
  const topics = app.get("kafka_topics");

  new DataService().start(kafkaHost, topics);
}
