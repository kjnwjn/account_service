const amqplib = require("amqplib");
const amqp_url_docker = "amqp://localhost";
const receiveQueue = async () => {
    try {
        // create connection
        const connection = await amqplib.connect(amqp_url_docker);
        // create channel
        const channel = await connection.createChannel();
        const queueName = "test-queue";
        // create queue

        await channel.assertQueue(queueName, {
            durable: false,
        });
        await channel.consume(
            queueName,
            (msg) => {
                console.log("msg received : ====", msg.content.toString());
            },
            {
                noAck: true,
            }
        );
        // close connection
    } catch (e) {
        console.log(e);
    }
};
module.exports = { receiveQueue };
