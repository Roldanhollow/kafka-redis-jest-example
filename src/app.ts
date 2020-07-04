import path from "path";
import favicon from "serve-favicon";
import compress from "compression";
import helmet from "helmet";
import cors from "cors";
import actuator from "express-actuator";
import prometheusClient from "prom-client";

import feathers from "@feathersjs/feathers";
import configuration from "@feathersjs/configuration";
import express from "@feathersjs/express";
//import socketio from "@feathersjs/socketio";

import { Application } from "./declarations";
import logger from "./logger";
import middleware from "./middleware";
import services from "./services";
import appHooks from "./app.hooks";
import channels from "./channels";
// Don't remove this comment. It's needed to format import lines nicely.

const app: Application = express(feathers());

// Load app configuration
app.configure(configuration());

// Enable security, CORS, compression, favicon and body parsing
app.use(logger);
app.use(helmet());
app.use(cors());
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get("public"), "favicon.ico")));
// Host the public folder
app.use("/", express.static(app.get("public")));

//actuator
app.use("/actuator", actuator({ infoGitMode: "full" }));

const collectDefaultMetrics = prometheusClient.collectDefaultMetrics;
// @ts-ignore
collectDefaultMetrics({ timeout: 15000 });
app.get("/metrics", (req: any, res: any) => {
  res.set("Content-Type", prometheusClient.register.contentType);
  res.end(prometheusClient.register.metrics());
});

// Set up Plugins and providers
app.configure(express.rest());
//app.configure(socketio());

// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);
// Set up our services (see `services/index.js`)
app.configure(services);
// Set up event channels (see channels.js)
app.configure(channels);

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
// app.use(express.errorHandler({ logger } as any));

app.hooks(appHooks);

export default app;
