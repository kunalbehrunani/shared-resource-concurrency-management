# Shared Resource Concurrency Management
A Backend Application built on `NodeJS Runtime Environment` using `Typescript` and `NestJS` Framework that simulates the race condition of updating a shared resource by multiple processes in an single application or across distributed micro-services architecture.

<br />

## Overview
This application simulates a race condition scenario where multiple processes (internal or external) are attempting to update a shared resource.

### Design
<img width="985" alt="Screenshot 2024-08-17 at 5 16 13 AM" src="https://github.com/user-attachments/assets/9c85f4b8-8b6a-4cb9-9bdb-7d5c359b072e">

### Simulation
• Shared Resource - Redis server is used to simulate the shared resource. For reference, an action `increamentCounter` is used to increament the value of a key in redis by 1.

• FIFO Queue - Redis server is used to implement the FIFO queue. Commands - `lpush` & `rpop` are used to simulate the first-in-first-out nature.

• FIFO Queue Consumer - NodeJS `SetInterval` method is used to simulate a queue consumer by monitoring the FIFO queue at regular intervals (configurable).

• PUB/SUB - Rabbit MQ Pub/Sub model is used to implement the publisher-subscriber event driven architecture for simulating communication across multiple processes.

• MULTIPLE PROCESSES - NestJS modular design pattern is used to simulate multiple processes. Separate modules - `module-a`, `module-b` etc are created that attempt to update the shared resource at regular intervals (configurable) using `setInterval`.

### Explanation
1. The shared resource (redis client) is **protected** and not exposed to any external module for any direct update.
2. All external modules interact with the shared resource via a FIFO queue (implemented using Redis).
3. A consumer monitors the FIFO queue for any input messages and processes them.
4. Before processing any given message, the consumer creates a **redis lock** to avoid multiple messages being processed at a concurrent time.
5. The consumer parses the message, extracts necessary information, and performs the update query on the shared resource.
6. Upon successfull updation, the consumer publishes an event to the rabbit-mq queue based on publisher/subscriber pattern.
7. All subscribers (external modules) are prompted of the updated resource using event-driven architecture.
8. After the message has been processed completely, the consumer deletes the redis lock to allow processing of other messages in the FIFO queue. 

<br />

## Getting Started

### Prerequsite
1. Node.js (v18.x or higher) run time environment
2. NVM (v0.39.x or higher)
3. Redis Server (Ref: https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/)
4. RabbitMQ Server (Ref: https://www.rabbitmq.com/docs/download)
   
### Installation
1. Start the redis server locally
```
# Open a new terminal and run the below command
redis-server
```
2. Start the rabbitMq server locally
```
# Open a new terminal and run the below command 
rabbitmq-server
```
3. Clone the repository.
```
# Open a new terminal and run the below command
git clone https://github.com/kunalbehrunani/shared-resource-concurrency-management.git
```
4. Install dependencies.
```
# Navigate to project directory (cloned repository) and run the below command
cd shared-resource-concurrency-management
nvm use v18
npm install
```

### Run the application
1. Customise the parameters in the method `startConcurrentRequests` in `src/main.ts` file to simulate the race condition between multiple processes (modules) as intended.
2. Run the following command:
```
npm run start
```

### Output
1. Refer to `log/output.log` for detailed overview of the updates and processes on the shared resource.

<br />

## Contribute
Follow the below steps to contribute:
1. Fork the repository.
2. Create a new branch for your feature/bug-fix.
3. Commit your changes.
4. Push to your branch.
5. Create a Pull Request

<br />

## Stay in touch
- Author - [Kunal Behrunani](https://linkedin.com/in/kunalbehrunani)
