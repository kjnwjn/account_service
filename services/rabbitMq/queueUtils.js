const amqplib = require("amqplib");
const amqp_url_docker = "amqp://localhost";
const { EXCHANGE_TYPE, EXCHANGE_NAME } = require("../../configs/variables");

class queuesUtil {
    async connect() {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(await amqplib.connect(amqp_url_docker));
            } catch (error) {
                reject(error);
            }
        });
    }

    async consumeExchange(
        exchange = EXCHANGE_NAME,
        exchangeType = EXCHANGE_TYPE,
        bindingKey = "",
        exchangeOptions = amqplib.Options.AssertExchange,
        consumeOptions = amqplib.Options.Consume,
        callback = () => {}
    ) {
        return new Promise(async (resolve, reject) => {
            try {
                const connection = await this.connect();
                const channel = await connection.createChannel();
                await channel.assertExchange(exchange, exchangeType, exchangeOptions);
                const assertQueue = await channel.assertQueue("", { exclusive: true });
                await channel.bindQueue(assertQueue.queue, exchange, bindingKey);
                const data = await channel.consume(
                    assertQueue.queue,
                    async (consumeMessage) => {
                        if (consumeMessage) {
                            callback(consumeMessage.content ? JSON.parse(consumeMessage.content.toString()) : {});
                        } else {
                            reject(false);
                        }
                    },
                    consumeOptions
                );
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    async publishMessageToExchange(
        exchange = EXCHANGE_NAME,
        exchangeType = EXCHANGE_TYPE,
        routingKey = "",
        exchangeOptions = amqplib.Options.AssertExchange,
        publishOptions = amqplib.Options.Publish,
        message = null
    ) {
        return new Promise(async (resolve, reject) => {
            try {
                const connection = await this.connect();
                const channel = await connection.createChannel();
                await channel.assertExchange(exchange, exchangeType, exchangeOptions);
                channel.publish(
                    exchange,
                    routingKey,
                    Buffer.from(message ? JSON.stringify(message) : {}),
                    publishOptions
                );
                resolve(true);
                setTimeout(async () => {
                    await connection.close();
                }, 5000);
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = new queuesUtil();
// static async consumeQueue(
//     queue = Queues,
//     queueOptions = amqplib.Options.AssertQueue,
//     consumeOptions = amqplib.Options.Consume
// ) {
//     try {
//         const connection = await this.connect();
//         const channel = await connection.createChannel();
//         await channel.assertQueue(queue, queueOptions);
//         const data = await channel.consume(
//             queue,
//             async (consumeMessage) => {
//                 if (consumeMessage) {
//                     return JSON.parse(consumeMessage.content);
//                 }else {
//                     return false;
//                 }
//             },
//             consumeOptions
//         );
//        return data;
//     } catch (error) {
//         reject(error);
//     }
// }
// static async consumeRPC(
//     queue = Queues,
//     queueOptions = Options.AssertQueue,
//     consumeOptions = Options.Consume,
//     consumerService = (params = null) => params
// ) {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const connection = await this.connect();
//             const channel = await connection.createChannel();
//             await channel.assertQueue(queue, queueOptions);
//             await channel.consume(
//                 queue,
//                 async (consumeMessage) => {
//                     if (consumeMessage) {
//                         await consumerService(
//                             consumeMessage.content && consumeMessage.content.length > 0
//                                 ? JSON.parse(consumeMessage.content.toString())
//                                 : {}
//                         )
//                             .then((response: any) => {
//                                 channel.sendToQueue(
//                                     consumeMessage.properties.replyTo,
//                                     Buffer.from(JSON.stringify(response)),
//                                     { correlationId: consumeMessage.properties.correlationId }
//                                 );
//                             })
//                             .catch((error: any) => {
//                                 channel.sendToQueue(
//                                     consumeMessage.properties.replyTo,
//                                     Buffer.from(JSON.stringify(error)),
//                                     { correlationId: consumeMessage.properties.correlationId }
//                                 );
//                             });
//                         channel.ack(consumeMessage);
//                     } else reject(new BusinessException(ResponseStatusCodes.MESSAGE_NOT_FOUND_TO_CONSUME.code));
//                 },
//                 consumeOptions
//             );
//             resolve();
//         } catch (error) {
//             reject(error);
//         }
//     });
// }

// const receiveExchange = async () => {
//     try {
//         // create connection
//         const connection = await amqplib.connect(amqp_url_docker);
//         // create channel
//         const channel = await connection.createChannel();
//         // create queue
//         const exchangeName = "abc";
//         await channel.assertExchange(exchangeName, "direct", {
//             durable: true,
//         });
//         const { queue } = await channel.assertQueue("abc");
//         await channel.bindQueue(queue, exchangeName, "abc");
//         await channel.consume(
//             queue,
//             async (msg) => {
//                 const data = JSON.parse(msg.content);

//                 console.log(data);
//             },
//             { noAck: true }
//         );
//         // close connection
//     } catch (e) {
//         console.log(e);
//     }
// };
// module.exports = { receiveExchange };
