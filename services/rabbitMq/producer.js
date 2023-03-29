const amqplib = require("amqplib");
const amqp_url_docker = "amqp://localhost";
const sendQueue = async ({ msg }) => {
    try {
        // create connection
        const connection = await amqplib.connect(amqp_url_docker);
        // create channel
        const channel = await connection.createChannel();
        const queueName = "test-queue";
        // create queue
        await channel.assertQueue(queueName, {
            durable: true,
        });

        await channel.sendToQueue(queueName, Buffer.from(msg), { persistent: true });
        // close connection
        // await connection.close();
    } catch (e) {
        console.log(e);
    }
};

module.exports = { sendQueue };
