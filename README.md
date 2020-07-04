# kafka-redis-jest-example

>

## About

This project uses [Feathers](http://feathersjs.com). An open source web framework for building modern real-time applications.

## Getting Started

Getting up and running is as easy as 1, 2, 3.

1. Make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
2. Install your dependencies

   ```
   cd kafka-redis-jest-example
   npm install
   ```

3. Start your app

   ```
   npm start
   ```

To use locally:

1. Run Kafka, Zookepeer and Redis, and create example-topic topic also:

   ```
   - cd kafka-redis-jest-example
   - docker-compose -f docker-compose-dev.yml up
   - docker-compose -f docker-compose-dev.yml exec kafka kafka-topics --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1 --topic example-topic
   ```

   - Note: To delete topics
     ```
     docker-compose -f docker-compose-dev.yml exec kafka kafka-topics --delete --bootstrap-server localhost:9092 --topic example-topic
     ```

2. Enable topics to send messages:

   ```
   docker-compose -f docker-compose-dev.yml exec kafka kafka-console-producer --broker-list localhost:9092 --topic example-topic
   ```

   - Note: A valid example message can be found [here](validExampleMessage.json), Single json line [here](https://www.textfixer.com/tools/remove-line-breaks.php)

3. Check on redis your message is already there.

   ```
   redis-cli
   keys *
   ```

4. Steps to run Prometeus & Grafana:

```bash
   git clone https://github.com/stefanprodan/dockprom
   cd dockprom

   ADMIN_USER=admin ADMIN_PASSWORD=admin docker-compose up -d
   Prometheus >> localhost:9090
   Grafana >> localhost:3000
```

## Actuator

To get more information about express-actuator check here: https://openbase.io/js/express-actuator/documentation

- /actuator/metrics
- /actuator/health
- /actuator/info

## Testing

Simply run `npm test` and all your tests in the `test/` directory will be run.

## Scaffolding

Feathers has a powerful command line interface. Here are a few things it can do:

```
$ npm install -g @feathersjs/cli          # Install Feathers CLI

$ feathers generate service               # Generate a new Service
$ feathers generate hook                  # Generate a new Hook
$ feathers help                           # Show all commands
```

## Help

For more information on all the things you can do with Feathers visit [docs.feathersjs.com](http://docs.feathersjs.com).
